import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { ROLE_FIELDS } from './role';

// Fields that can be exposed in a query
export const TRAIT_FIELDS = [
    'id',
    'name',
    'value'
];

const relationships = [
    ['many-many', 'plants', TABLES.Plant, TABLES.PlantTraits, ROLE_FIELDS, 'plantId', 'traitId']
];

export const typeDef = gql`
    type Trait {
        id: ID!
        name: String!
        value: String!
        plants: [Plant!]!
    }

    extend type Query {
        traitNames: [String!]!
        traitValues(name: String!): [String!]!
    }
`

export const resolvers = {
    Query: {
        traitNames: async () => {
            return await db(TABLES.Trait).select('name');
        },
        traitValues: async (_, args) => {
            return await db(TABLES.Trait).select('value').where('name', args.name)
        }
    },
}