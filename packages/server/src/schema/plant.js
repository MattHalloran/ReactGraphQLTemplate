import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE, SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Plant;

export const typeDef = gql`

    input PlantTraitInput {
        name: String!
        value: String!
    }

    input PlantImageInput {
        src: String!
        alt: String
        description: String
        labels: [String!]!
    }

    input PlantInput {
        id: ID
        latinName: String!
        traits: [PlantTraitInput]!
        images: [PlantImageInput]!
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
        deletePlants(ids: [ID!]!): Boolean
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
            return await context.prisma[_model].create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updatePlant: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await context.prisma[_model].update((new PrismaSelect(info).value), {
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deletePlants: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await context.prisma[_model].delete((new PrismaSelect(info).value), {
                where: { id: { in: args.ids } }
            })
        },
    }
}