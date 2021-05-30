import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';

// Fields that can be exposed in a query
export const TRAIT_FIELDS = [
    'id',
    'name',
    'value'
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
    
}