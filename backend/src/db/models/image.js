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
import { saveImage } from '../../utils';
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

    type ImageResponse {
        successfulFileNames: [String!]!
        failedFileNames: [String!]!
    }

    type Image {
        id: ID!
        extension: String!
        alt: String
        hash: String!
        width: Int!
        height: Int!
        labels: [String!]!
    }

    extend type Query {
        image(id: ID!, size: ImageSize): Image
        images(label: String!, size: ImageSize): [Image!]!
    }

    extend type Mutation {
        addImage(
            files: [Upload!]!
            alts: [String]
            labels: [String!]!
        ): ImageResponse!
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
        image: async (_, args, context, info) => {
            // Locate image in database
            const image = await db(TABLES.Image).select('*').where('id', args.id).first();
            if (image === undefined) return CustomError(CODE.ErrorUnknown);
            // If size not specified, default to medium
            const size = args.size ?? IMAGE_SIZE.M;
            const image_regex = `../../../images/${image.folder}/${image.fileName}-*.${image.extension}`;
            return CustomError(CODE.NotImplemented);
        },
        images: async (_, args, context, info) => {
            // Locate images in database
            const images = await db(TABLES.Image).select('*').where('label', args.label);
            if (images === undefined || images.length === 0) return CustomError(CODE.ErrorUnknown);
            // If size not specified, default to medium
            const size = args.size ?? IMAGE_SIZE.M;
            return CustomError(CODE.NotImplemented);
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
                const { createReadStream, filename, mimetype } = await args.files[0];
                // Make sure that the file is actually an image
                if (!mimetype.startsWith('image/')) return CustomError(CODE.InvalidArgs);
                // Make sure image type is supported
                let { ext: extCheck } = path.parse(filename);
                if (Object.values(IMAGE_EXTENSION).indexOf(extCheck.replace('.', '')) <= 0) return CustomError(CODE.InvalidArgs);
                // Create a read stream
                const stream = createReadStream();
                const { success, filename: finalFilename, dimensions, hash } = await saveImage(stream, filename, 'images')
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