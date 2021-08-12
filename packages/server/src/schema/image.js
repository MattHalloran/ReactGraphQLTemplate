import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE, IMAGE_EXTENSION, IMAGE_SIZE, SERVER_URL } from '@local/shared';
import { CustomError } from '../error';
import path from 'path';
import { deleteImage, findImageUrl, plainImageName, saveImage } from '../utils';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Image;

// Query image data from a src path (ex: 'https://thewebsite.com/api/images/boop.png')
async function imageFromSrc(src, prisma) {
    // Parse name, extension, and folder from src path. This gives a unique row
    let { name, ext } = plainImageName(src);
    return await prisma[_model].findFirst({ where: { 
        file: name,
        ext,
        folder: 'images'
    } });
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

    type AddImageResponse {
        successfulFileNames: [String!]!
        failedFileNames: [String!]!
    }

    type Image {
        id: ID!
        src: String!
        alt: String
        description: String
        width: Int!
        height: Int!
    }

    extend type Query {
        imagesByLabel(label: String!, size: ImageSize): [Image!]!
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
        imagesByLabel: async (_, args, context, info) => {
            // Locate images in database
            let image_data = await context.prisma[_model].findMany((new PrismaSelect(info).value), { 
                where: { 
                    labels: { 
                        contains: { label: args.label }
                    } 
                } 
            });
            console.log('ARGS.SIZE is')
            console.log(args.size)
            // Add size identifier to image srcs, if requested
            if (image_data?.length > 0 && image_data[0].src) {
                image_data = image_data.map(d => {
                    return {
                        ...d,
                        src: findImageUrl(d.src, args.size)
                    }
                })
            }
            return image_data;
        }
    },
    Mutation: {
        addImages: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
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
                console.log('ABOUT TO CALL SAVE IMAGE', filename)
                const { success, filename: finalFilename, dimensions, hash } = await saveImage(stream, filename)
                if (success) {
                    successfulFileNames.push(finalFilename);
                    // Add image metadata to database
                    console.log('PARSING FILE NAME', finalFilename)
                    const { name, ext } = path.parse(finalFilename);
                    console.log('INSERTING IMAGE WITH EXTENSION ', ext)
                    await db(_model).insert({
                        hash: hash,
                        folder: 'images',
                        file: name,
                        ext: ext,
                        alt: args.alts ? args.alts[i] : '',
                        width: dimensions.width,
                        height: dimensions.height
                    });
                    console.log('INSERTED IMAGE MODEL. NOW INSERTING LABELS', args.labels)
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
        updateImages: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Loop through update data passed in
            for (let i = 0; i < args.data.length; i++) {
                const image = await imageFromSrc(args.data[i].src, context.prisma);
                console.log('IN UPDATE IMAGES', args.data[i])
                await context.prisma[_model].update({
                    where: { id: image.id },
                    data: { 
                        alt: args.data[i].alt,
                        description: args.data[i].description,
                    }
                })
            }
            if (!args.deleting) return true;
            // Loop through delete data passed in
            for (let i = 0; i < args.deleting.length; i++) {
                const image = await imageFromSrc(args.deleting[i], context.prisma);
                console.info('deleting image...', image);
                await deleteImage(`${image.file}${image.ext}`);
                await context.prisma[_model].delete({ where: { id: image.id } })
            }
            return true;
        },
        deleteImagesById: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Delete the files
            const srcs = await db(_model).select('src').whereIn('id', args.ids);
            for (let i = 0; i < srcs.length; i++) {
                await deleteImage(src[i]);
            }
            // Delete the database rows
            return await context.prisma[_model].delete({
                where: { id: { in: args.ids } }
            })
        },
        deleteImagesByLabel: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Delete the files
            const srcs = await db(_model).select('src').whereIn('label', args.labels);
            for (let i = 0; i < filenames.length; i++) {
                await deleteImage(srcs);
            }
            // Delete the database rows
            return await context.prisma[_model].delete({
                where: { label: { in: args.labels } }
            })
        },
    }
}