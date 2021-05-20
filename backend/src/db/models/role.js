import { gql } from 'apollo-server-express';

export const typeDef = gql`
    type Role {
        id: ID!
        title: String!
        description: String
        users: [User!]!
    }

    extend type Query {
        roles(ids: [ID!]): [Role!]!
    }

    extend type Mutation {
        addRole(
            title: String!
        ): Role!
        updateRole(
            id: ID!
            title: String
            description: String
        ): Role!
        deleteRole(
            id: ID!
        ): Response
        setRoleAssociations(
            roleId: ID!
            userIds: [ID!]!
        ): Response
    }
`

export const resolvers = {
    
}