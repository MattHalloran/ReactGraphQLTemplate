import { gql } from 'apollo-server-express';
import { TABLES } from '../db';
import { CODE, SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';
import { saveImage } from '../utils';

const _model = TABLES.Plant;

export const typeDef = gql`

    input PlantTraitInput {
        name: String!
        value: String!
    }

    input PlantImageInput {
        files: [Upload!]!
        alts: [String]
        labels: [String!]!
    }

    input PlantInput {
        id: ID
        latinName: String!
        traits: [PlantTraitInput]!
        images: PlantImageInput
    }

    type PlantImage {
        image: Image!
    }

    type Plant {
        id: ID!
        latinName: String!
        traits: [PlantTrait!]
        images: [PlantImage!]
        skus: [Sku!]
    }

    extend type Query {
        plants(ids: [ID!]): [Plant!]!
        activePlants(sortBy: SkuSortBy): [Plant!]!
        inactivePlants(sortBy: SkuSortBy): [Plant!]!
    }

    extend type Mutation {
        addPlant(input: PlantInput!): Plant!
        updatePlant(input: PlantInput!): Plant!
        deletePlants(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Query: {
        plants: async (_, _args, context, info) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value));
        },
        activePlants: async (_, args, context, info) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value), { 
                where: { 
                    skus: { 
                        contains: { status: SKU_STATUS.Active }
                    } 
                } 
            });
        },
        inactivePlants: async (_, args, context, info) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value), { 
                NOT: {
                    where: { 
                        skus: { 
                            contains: { status: SKU_STATUS.Active }
                        } 
                    }
                }
            });
        }
    },
    Mutation: {
        // Inserting plants is different than other inserts, because the fields are dynamic.
        // Because of this, the add must be done manually
        addPlant: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            // Create plant object
            const plant = await context.prisma[_model].create((new PrismaSelect(info).value), { data: { id: args.input.id, latinName: args.input.latinName } });
            // Create trait objects
            for (const { name, value } of (args.input.traits || [])) {
                await prisma[TABLES.PlantTrait].create({ data: { plantId: plant.id, name, value } });
            }
            // Create images
            for (const image of (args.input?.images?.files || [])) {
                const { success, imageId } = await saveImage(image, errorOnDuplicate=false)
                if (success) {
                    await prisma[TABLES.PlantImages].create({ data: { 
                        plantId: plant.id,
                        imageId
                     } });
                } else {
                    console.error('Plant image save not successful')
                }
            }
            // TODO Return select
        },
        updatePlant: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images and traits
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deletePlants: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await context.prisma[_model].deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}