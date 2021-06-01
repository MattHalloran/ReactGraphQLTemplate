import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { ROLE_RELATIONSHIPS } from '../relationships';

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
    Query: {
        roles: async (_, args, context, info) => {
            // Only admins can query roles
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.Role, ROLE_RELATIONSHIPS);
        }
    },
    Mutation: {
        addRole: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updateRole: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteRole: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        setRoleAssociations: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
    }
}