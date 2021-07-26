import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';

export const typeDef = gql`
    extend type Query {
        traitNames: [String!]!
        traitValues(name: String!): [String!]!
    }
`

export const resolvers = {
    Query: {
        traitNames: async () => {
            return await db(TABLES.PlantTrait).select('name').unique();
        },
        traitValues: async (_, args) => {
            return await db(TABLES.PlantTrait).select('value').where('name', args.name)
        }
    },
}