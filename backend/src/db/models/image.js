import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import sizeOf from 'image-size';
import path from 'path';
import fs from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import { saveFile } from '../../utils';

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
        addImage: async (_, args, context, info) => {
            // Only admins can add images
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            let successfulFileNames = [];
            let failedFileNames = [];
            // Loop through every image passed in
            for (let i = 0; i < args.files.length; i++) {
                // Destructure data. Each file is a promise
                const { createReadStream, filename, mimetype } = await args.files[0];
                // Make sure that the file is actually an image
                if (!mimetype.startsWith('image/')) return CustomError(CODE.InvalidArgs);
                // Create a read stream
                const stream = createReadStream();
                const { success, finalFilename } = saveFile(stream, filename, 'images')
                if (success) successfulFileNames.push(finalFilename);
                else failedFileNames.push(finalFilename);
                // TODO add to database
            }
            return {
                successfulFileNames,
                failedFileNames
            };
        },
        deleteImagesById: async (_, args, context, info) => {
            // Only admins can delete images
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        deleteImagesByLabel: async (_, args, context, info) => {
            // Only admins can delete images
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
    }
}