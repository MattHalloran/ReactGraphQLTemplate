import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE, SKU_SORT_OPTIONS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Plant;

export const typeDef = gql`

    input PlantImage {
        files: [Upload!]!
        alts: [String]
        labels: [String!]!
    }

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

    type Plant {
        id: ID!
        latinName: String!
        traits: [PlantTrait!]
        images: [ImageData!]
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
        plants: async (_, _args, context) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany();
        },
        activePlants: async (_, args, context) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // // Active plants are referenced by a SKU
            // const active_ids = await db(TABLES.Sku).select('plantId');
            // let plant_data = selectQueryHelper(Model, info, active_ids);
            // console.log('ACTIVE PLANT DATA ISSSS', plant_data)
            // const sortBy = args.sortBy || SKU_SORT_OPTIONS.AZ;
            // //TODO sort
            // return plant_data;
            return new CustomError(CODE.NotImplemented);
        },
        inactivePlants: async (_, args, context) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // // Active plants are referenced by no SKUs
            // const all_ids = await db(_model).select('id');
            // const active_ids = await db(TABLES.Sku).select('plantId');
            // const inactive_ids = all_ids.filter(id => !active_ids.includes(id));
            // let plant_data = selectQueryHelper(Model, info, inactive_ids);
            // const sortBy = args.sortBy || SKU_SORT_OPTIONS.AZ;
            // //TODO sort
            // return plant_data;
            return new CustomError(CODE.NotImplemented);
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