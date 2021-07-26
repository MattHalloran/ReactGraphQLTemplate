import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper, 
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
        latinName: String!
        traits: [PlantTraitInput]!
        images: [PlantImageInput]!
    }

    type Plant {
        id: ID!
        latinName: String!
        # Text data stored as JSON. 
        # Unique fields are added to Trait table. 
        # Field values are added to association table
        # This allows new attributes to be added without updating the database, and the ability to easily filter
        traitData: String!
        # Associated image labels and IDs stored as JSON
        imageData: String!
        skus: [Sku!]
    }

    extend type Query {
        plants(ids: [ID!]): [Plant!]!
        activePlants: [Plant!]!
        inactivePlants: [Plant!]!
    }

    extend type Mutation {
        addPlant(input: PlantInput!): Plant!
        updatePlant(id: ID!, input: PlantInput!): Plant!
        deletePlants(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        plants: async (_, args, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        },
        activePlants: async (_, _a, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Active plants are referenced by a SKU
            const active_ids = await db(TABLES.Sku).select('plantId');
            return fullSelectQueryHelper(Model, info, active_ids);
        },
        inactivePlants: async (_, _a, { req }, info) => {
            // Must be admin (customers query SKUs)
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Active plants are referenced by no SKUs
            const all_ids = await db(Model.name).select('id');
            const active_ids = await db(TABLES.Sku).select('plantId');
            const inactive_ids = all_ids.filter(id => !active_ids.includes(id));
            return fullSelectQueryHelper(Model, info, inactive_ids);
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
            return await updateHelper({ model: Model, info: info, id: args.id, input: args.input });
        },
        deletePlants: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await deleteHelper(Model.name, args.ids);
        },
    }
}