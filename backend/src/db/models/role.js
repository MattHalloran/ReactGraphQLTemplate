import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper } from '../query';
import { RoleModel as Model } from '../relationships';

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
            userIds: [ID!]
        ): Role!
        deleteRoles(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        roles: async (_, args, { req, res }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addRole: async (_, args, { req, res }) => {
            return CustomError(CODE.NotImplemented);
        },
        updateRole: async (_, args, { req, res }) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteRoles: async (_, args, { req }) => {
            // Only admins can delete
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}