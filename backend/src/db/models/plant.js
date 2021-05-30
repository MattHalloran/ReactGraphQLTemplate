import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';

// Fields that can be exposed in a query
export const PLANT_FIELDS = [
    'id',
    'latinName',
    'textData',
    'imageData'
];

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
    
}