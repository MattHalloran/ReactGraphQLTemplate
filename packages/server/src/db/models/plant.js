import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE, SKU_SORT_OPTIONS } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    selectQueryHelper, 
    updateHelper
} from '../query';
import { PlantModel as Model } from '../relationships';
import { TABLES } from '../tables';

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
        plants: async (_, args, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return selectQueryHelper(Model, info, args.ids);
        },
        activePlants: async (_, args, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Active plants are referenced by a SKU
            const active_ids = await db(TABLES.Sku).select('plantId');
            let plant_data = selectQueryHelper(Model, info, active_ids);
            console.log('ACTIVE PLANT DATA ISSSS', plant_data)
            const sortBy = args.sortBy || SKU_SORT_OPTIONS.AZ;
            //TODO sort
            return plant_data;
        },
        inactivePlants: async (_, args, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Active plants are referenced by no SKUs
            const all_ids = await db(Model.name).select('id');
            const active_ids = await db(TABLES.Sku).select('plantId');
            const inactive_ids = all_ids.filter(id => !active_ids.includes(id));
            let plant_data = selectQueryHelper(Model, info, inactive_ids);
            const sortBy = args.sortBy || SKU_SORT_OPTIONS.AZ;
            //TODO sort
            return plant_data;
        }
    },
    Mutation: {
        // Inserting plants is different than other inserts, because the fields are dynamic.
        // Because of this, the add must be done manually
        addPlant: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updatePlant: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await updateHelper({ model: Model, info: info, input: args.input });
        },
        deletePlants: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await deleteHelper(Model.name, args.ids);
        },
    }
}