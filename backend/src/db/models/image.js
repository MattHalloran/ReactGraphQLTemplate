import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE, IMAGE_EXTENSION } from '@local/shared';
import { IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import sizeOf from 'image-size';
import path from 'path';
import fs from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import { findImage, saveImage } from '../../utils';
import { ImageModel as Model } from '../relationships';

export const typeDef = gql`
    scalar Upload

    enum ImageSize {
        XS
        S
        M
        ML
        L
    }

    type ImageLabelResponse {
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
        imagesByLabel(label: String!, size: ImageSize): [ImageLabelResponse!]!
    }

    extend type Mutation {
        addImage(
            files: [Upload!]!
            alts: [String]
            labels: [String!]!
        ): AddImageResponse!
        deleteImagesById(
            ids: [ID!]!
        ): Response
        # Images with labels that are not in this request will be saved
        deleteImagesByLabel(
            labels: [String!]!
        ): Response
    }
`

export const resolvers = {
    Upload: GraphQLUpload,
    ImageSize: IMAGE_SIZE,
    Query: {
        imagesByName: async (_, args, {req, res}, info) => {
            console.log('IN IMAGES BY NAMEEEE', args)
            // Loop through each fileName
            const paths = [];
            for (let i = 0; i < args.fileNames.length; i++) {
                // Try returning the image in the requested size, or any available size
                const filePath = await findImage(args.fileNames[i], args.size);
                paths.push(filePath);
            }
            return paths;
        },
        imagesByLabel: async (_, args, context, info) => {
            // Locate images in database
            const images = await db(TABLES.Image)
                .select('*')
                .leftJoin(TABLES.ImageLabels, `${TABLES.ImageLabels}.hash`, `${TABLES.Image}.hash`)
                .where(`${TABLES.ImageLabels}.label`, args.label);
            console.log('GOT IMAGESSSSSSS', images)
            if (images === undefined || images.length === 0) return CustomError(CODE.NoResults);
            // Loop through each image
            const image_data = [];
            for (let i = 0; i < images.length; i++) {
                // Try returning the image in the requested size, or any available size
                const filePath = await findImage(`${images[i].fileName}.${images[i].extension}`, args.size);
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
        addImage: async (_, args, {req, res}, info) => {
            // Only admins can add images
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
                if (!mimetype.startsWith('image/')) return CustomError(CODE.InvalidArgs);
                // Make sure image type is supported
                let { ext: extCheck } = path.parse(filename);
                if (Object.values(IMAGE_EXTENSION).indexOf(extCheck.replace('.', '')) <= 0) return CustomError(CODE.InvalidArgs);
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
                        extension: ext.replace('.', ''),
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
                    console.log('NOT SUCCESSFUL', dimensions, hash)
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
        deleteImagesById: async (_, args, {req, res}, info) => {
            // Only admins can delete images
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        deleteImagesByLabel: async (_, args, {req, res}, info) => {
            // Only admins can delete images
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
    }
}