import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { TABLES } from '../db';

const _model = TABLES.Role;

export const typeDef = gql`
    input RoleInput {
        id: ID
        title: String!
        description: String
        customerIds: [ID!]
    }

    type CustomerRole {
        customer: Customer!
        role: Role!
    }//TODO morning me: many-to-many relationships must go through join table

    type Role {
        id: ID!
        title: String!
        description: String
        customers: [Customer!]!
    }

    extend type Query {
        roles: [Role!]!
    }

    extend type Mutation {
        addRole(input: RoleInput!): Role!
        updateRole(input: RoleInput!): Role!
        deleteRoles(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        roles: async (_, _args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany();
        }
    },
    Mutation: {
        addRole: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create({ data: { ...args.input } })
        },
        updateRole: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deleteRoles: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete({
                where: { id: { in: args.ids } }
            })
        }
    }
}