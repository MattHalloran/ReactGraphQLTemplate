import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import sizeOf from 'image-size';
import path from 'path';
import fs from 'fs';

export const typeDef = gql`
    enum ImageSize {
        XS
        S
        M
        ML
        L
    }

    type ImageResponse {
        fileName: String!
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
            file: Upload!
            alt: String
            labels: [String!]!
        ): Response!
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
            const { createReadStream, fileName, mimeType, encoding } = await args.file;
            const stream = createReadStream();
            const tempName = 'aaaaaaaaaaaaboopfdasfdasf';
            //sizeOf()
            const fileDirectory = path.join(__dirname, `../../../${tempName}`);
            await stream.pipe(fs.createWriteStream(pathName))
            return { fileName: tempName }
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