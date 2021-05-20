import { gql } from 'apollo-server-express';

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