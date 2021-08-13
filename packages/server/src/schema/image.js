import { gql } from 'apollo-server-express';
import { TABLES } from '../db';
import { CODE, IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import { deleteImage, plainImageName, saveImage } from '../utils';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Image;

// Query image data from a src path (ex: 'https://thewebsite.com/api/images/boop.png')
async function imageFromSrc(src, prisma) {
    // Parse name, extension, and folder from src path. This gives a unique row
    let { name, ext } = plainImageName(src);
    return await prisma[_model].findUnique({ where: { 
        file: name,
        ext,
        folder: 'images'
    } });
}

export const typeDef = gql`
    enum ImageSize {
        XXS
        XS
        S
        M
        ML
        L
        XL
        XXL
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
        imagesByLabel(label: String!): [Image!]!
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
        ): Count!
        # Images with labels that are not in this request will be saved
        deleteImagesByLabel(
            labels: [String!]!
        ): Count!
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
                const { success, filename: finalFilename, hash } = await saveImage(args.files[i], args.alts ? args.alts[i] : undefined, errorOnDuplicate = false)
                if (success) {
                    successfulFileNames.push(finalFilename);
                    for (let j = 0; j < args.labels.length; j++) {
                        await prisma[TABLES.ImageLabels].create({ data: { 
                            hash: hash,
                            label: args.labels[j]
                         } });
                    }
                } else {
                    console.error('NOT SUCCESSFUL')
                    failedFileNames.push(filename);
                }
            }
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
            const images = context.prisma[_model].findMany({ where: { id: args.ids } });
            for (const image of images) {
                await deleteImage(image.src);
            }
            return await context.prisma[_model].deleteMany({ where: { id: { in: images.ids } } });
        },
        deleteImagesByLabel: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Find all image_label data matching request
            const labels = await context.prisma[TABLES.ImageLabels].findMany({ 
                where: { label: { in: args.labels } },
                select: { 
                    id: true,
                    label: true,
                    image: {
                        src: true,
                        labels: {
                            label: true
                        }
                    }
                }
            })
            console.log('GOT LABELS', labels);
            // Determine which images should be deleted (ones that lost all of their labels)
            const old_images = labels.map(l => l.image).filter(i => i.labels && i.labels.every(lab => args.labels.includes(lab.label)));
            console.log('deleting these images')
            console.log(old_images);
            // Delete images and labels data
            const count = await context.prisma[TABLES.ImageLabels].deleteMany({ where: { id: { in: labels.id } } });
            await context.prisma[_model].deleteMany({ where: { id: { in: old_images.id } } });
            // Delete image files
            for (const image of old_images) {
                await deleteImage(image.src);
            }
            return count;
        },
    }
}