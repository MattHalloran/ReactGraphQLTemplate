import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, insertJoinRowsHelper, updateHelper, updateJoinRowsHelper } from '../query';
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
            description: String
            userIds: [ID!]
        ): Role!
        updateRole(
            id: ID!
            title: String
            description: String
            userIds: [ID!]
        ): Role!
        deleteRoles(
            ids: [ID!]!
        ): Boolean
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

            const added = await db(Model.name).insertAndFetch({
                title: args.title,
                description: args.description ?? ''
            });
            await insertJoinRowsHelper(Model, 'users', added.id, args.userIds);
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateRole: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            await updateHelper(Model, args);
            await updateJoinRowsHelper(Model, 'users', args.id, args.userIds);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteRoles: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}