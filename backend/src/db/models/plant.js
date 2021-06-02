import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { SKU_FIELDS } from './sku';
import { PLANT_RELATIONSHIPS } from '../relationships';

export const typeDef = gql`
    type Plant {
        id: ID!
        latinName: String!
        # Text data stored as JSON. 
        # Unique fields are added to Trait table. 
        # Field values are added to association table
        # This allows new attributes to be added without updating the database, and the ability to easily filter
        textData: String!
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
        addPlant(
            latinName: String!
            textData: String
            imageData: String
        ): Plant!
        updatePlant(
            id: ID!
            latinName: String
            textData: String
            imageData: String
        ): Plant!
        deletePlant(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    Query: {
        plants: async (_, args, context, info) => {
            // Only admins can query plants directly (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(info, TABLES.Plant, args.ids, PLANT_RELATIONSHIPS);
        }
    },
    Mutation: {
        addPlant: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updatePlant: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deletePlant: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
    }
}