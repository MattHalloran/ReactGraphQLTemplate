import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper, 
    updateHelper
} from '../query';
import { RoleModel as Model } from '../relationships';

export const typeDef = gql`
    input RoleInput {
        title: String!
        description: String
        userIds: [ID!]
    }

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
        addRole(input: RoleInput!): Role!
        updateRole(id: ID!, input: RoleInput!): Role!
        deleteRoles(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        roles: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addRole: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updateRole: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, id: args.id, input: args.input });
        },
        deleteRoles: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}