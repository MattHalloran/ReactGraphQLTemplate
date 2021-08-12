import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.PlantTrait;

export const typeDef = gql`
    type PlantTrait {
        id: ID!
        name: String!
        value: String!
    }

    type TraitOptions {
        name: String!
        values: [String!]!
    }

    extend type Query {
        traitNames: [String!]!
        traitValues(name: String!): [String!]!
        traitOptions: [TraitOptions!]!
    }
`

export const resolvers = {
    Query: {
        traitNames: async () => {
            return await db(TABLES.PlantTrait).select('name').unique();
        },
        traitValues: async (_, args) => {
            return await db(TABLES.PlantTrait).select('value').where('name', args.name)
        },
        // Returns all values previously entered for every trait
        traitOptions: async (_, _args, context) => {
            // Query all data
            const trait_data = await context.prisma[_model].findMany();
            // Combine data into object
            let options = {};
            for (const row of trait_data) {
                options[row.name] ? options[row.name].append(row.value) : options[row.name] = [row.value];
            }
            // Format object
            let trait_options = []
            for (const [key, value] of Object.entries(options)) {
                trait_options.push({ name: key, values: [...new Set(value)] });
            }
            return trait_options;
        }
    },
}