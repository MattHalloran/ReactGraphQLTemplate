import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE, IMAGE_EXTENSION, IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import path from 'path';
import { deleteImage, findImageUrl, plainImageName, saveImage } from '../../utils';
import { ImageModel as Model } from '../relationships';
import { deleteHelper, updateHelper } from '../query';

// Query image data from a src path (ex: 'https://thewebsite.com/api/images/boop.png')
async function imageFromSrc(src) {
    // Parse name, extension, and folder from src path. This gives a unique row
    let { name, ext } = plainImageName(src);
    const { folder } = clean(src);
    // Update the row with the new information
    return await db(Model.name)
        .where('fileName', name)
        .andWhere('extension', ext)
        .andWhere('folder', folder)
        .first();
}

export const typeDef = gql`
    enum ImageSize {
        XS
        S
        M
        ML
        L
    }

    input ImageUpdate {
        src: String!
        alt: String
        description: String
    }

    type ImageData {
        src: String!
        alt: String
        description: String
    }

    type AddImageResponse {
        successfulFileNames: [String!]!
        failedFileNames: [String!]!
    }

    extend type Query {
        imagesByName(fileNames: [String!]!, size: ImageSize): [String]!
        imagesByLabel(label: String!, size: ImageSize): [ImageData!]!
    }

    extend type Mutation {
        addImages(
            files: [Upload!]!
            alts: [String]
            labels: [String!]!
        ): AddImageResponse!
        updateImages(
            data: [ImageUpdate!]!
            deleting: [String!]
        ): Boolean!
        deleteImagesById(
            ids: [ID!]!
        ): Boolean
        # Images with labels that are not in this request will be saved
        deleteImagesByLabel(
            labels: [String!]!
        ): Boolean
    }
`

export const resolvers = {
    ImageSize: IMAGE_SIZE,
    Query: {
        imagesByName: async (_, args) => {
            console.log('IN IMAGES BY NAMEEEE', args)
            // Loop through each fileName
            const paths = [];
            for (let i = 0; i < args.fileNames.length; i++) {
                // Try returning the image in the requested size, or any available size
                const filePath = await findImageUrl(args.fileNames[i], args.size);
                paths.push(filePath);
            }
            return paths;
        },
        imagesByLabel: async (_, args) => {
            // Locate images in database
            const images = await db(Model.name)
                .select('*')
                .leftJoin(TABLES.ImageLabels, `${TABLES.ImageLabels}.hash`, `${TABLES.Image}.hash`)
                .where(`${TABLES.ImageLabels}.label`, args.label);
            if (images === undefined || images.length === 0) return new CustomError(CODE.NoResults);
            // Loop through each image
            const image_data = [];
            for (let i = 0; i < images.length; i++) {
                // Try returning the image in the requested size, or any available size
                const filePath = await findImageUrl(`${images[i].folder}/${images[i].fileName}${images[i].extension}`, args.size);
                image_data.push({
                    src: filePath,
                    alt: images[i].alt,
                    description: images[i].description
                });
            }
            return image_data;
        }
    },
    Mutation: {
        addImages: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Check for valid arguments
            // If alts provided, must match length of files
            if (args.alts && args.alts.length !== args.files.length) return new CustomError(CODE.InvalidArgs);
            let successfulFileNames = [];
            let failedFileNames = [];
            // Loop through every image passed in
            for (let i = 0; i < args.files.length; i++) {
                // Destructure data. Each file is a promise
                const { createReadStream, filename, mimetype } = await args.files[i];
                // Make sure that the file is actually an image
                if (!mimetype.startsWith('image/')) return new CustomError(CODE.InvalidArgs);
                // Make sure image type is supported
                let { ext: extCheck } = path.parse(filename);
                if (Object.values(IMAGE_EXTENSION).indexOf(extCheck) <= 0) return new CustomError(CODE.InvalidArgs);
                // Create a read stream
                const stream = createReadStream();
                const { success, filename: finalFilename, dimensions, hash } = await saveImage(stream, filename)
                if (success) {
                    successfulFileNames.push(finalFilename);
                    // Add image metadata to database
                    const { name, ext } = path.parse(finalFilename);
                    await db(Model.name).insert({
                        hash: hash,
                        folder: 'images',
                        fileName: name,
                        extension: ext,
                        alt: args.alts ? args.alts[i] : '',
                        width: dimensions.width,
                        height: dimensions.height
                    });
                    for (let j = 0; j < args.labels.length; j++) {
                        await db(TABLES.ImageLabels).insert({
                            hash: hash,
                            label: args.labels[j]
                        });
                    }
                } else {
                    console.error('NOT SUCCESSFUL', dimensions, hash)
                    failedFileNames.push(filename);
                }
            }
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa')
            console.log({
                successfulFileNames,
                failedFileNames
            })
            return {
                successfulFileNames,
                failedFileNames
            };
        },
        updateImages: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Loop through update data passed in
            for (let i = 0; i < args.data.length; i++) {
                let image = await imageFromSrc(args.data[i].src);
                await updateHelper({ model: Model, id: image.id, input: args.data[i] });
            }
            if (!args.deleting) return true;
            // Loop through delete data passed in
            for (let i = 0; i < args.deleting.length; i++) {
                let image = await imageFromSrc(args.deleting[i]);
                console.info('deleting image...', image);
                await deleteImage(`${image.fileName}${image.extension}`);
                await deleteHelper(Model.name, [image.id]);
            }
            return true;
        },
        deleteImagesById: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Delete the files
            const filenames = await db(Model.name).select('folder', 'filename', 'extension').whereIn('id', args.ids);
            for (let i = 0; i < filenames.length; i++) {
                let curr = filenames[i];
                await deleteImage(`${curr.folder}/${curr.fileName}${curr.extension}`);
            }
            // Delete the database rows
            return await deleteHelper(Model.name, args.ids);
        },
        deleteImagesByLabel: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Delete the files
            const filenames = await db(Model.name).select('folder', 'filename', 'extension').whereIn('label', args.labels);
            for (let i = 0; i < filenames.length; i++) {
                let curr = filenames[i];
                await deleteImage(`${curr.folder}/${curr.fileName}${curr.extension}`);
            }
            // Delete the database rows
            await deleteHelper(Model.name, args.labels, 'label', true);
        },
    }
}