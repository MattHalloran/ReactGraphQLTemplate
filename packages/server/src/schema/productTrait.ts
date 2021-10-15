import { gql } from 'apollo-server-express';

export const typeDef = gql`
    type ProductTrait {
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
        traitNames: async (_parent, _args, context, _info) => {
            return await context.prisma.product_trait.findMany({ select: { name: true }, distinct: ['name']});
        },
        traitValues: async (_parent: undefined, args: any, context: any, _info: any) => {
            return await context.prisma.product_trait.findMany({ where: { name: args.name }, select: { value: true }})
        },
        // Returns all values previously entered for every trait
        traitOptions: async (_parent, _args, context, _info) => {
            // Query all data
            const trait_data = await context.prisma.product_trait.findMany();
            // Combine data into object
            let options = {};
            for (const row of trait_data) {
                options[row.name] ? options[row.name].push(row.value) : options[row.name] = [row.value];
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