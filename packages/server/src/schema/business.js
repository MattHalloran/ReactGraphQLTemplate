import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { TABLES } from '../db';

const _model = TABLES.Business;

export const typeDef = gql`
    input BusinessInput {
        id: ID
        name: String!
        subscribedToNewsletters: Boolean
        discountIds: [ID!]
        employeeIds: [ID!]
    }

    type Business {
        id: ID!
        name: String!
        subscribedToNewsletters: Boolean!
        addresses: [Address!]!
        phones: [Phone!]!
        emails: [Email!]!
        employees: [Customer!]!
        discounts: [Discount!]!
    }

    extend type Query {
        businesses: [Business!]!
    }

    extend type Mutation {
        addBusiness(input: BusinessInput!): Business!
        updateBusiness(input: BusinessInput!): Business!
        deleteBusinesses(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, _args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany();
        }
    },
    Mutation: {
        addBusiness: async(_, args, context) => {
            // Must be admin
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create({ data: { ...args.input } })
        },
        updateBusiness: async(_, args, context) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin || (context.req.token.businessId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deleteBusinesses: async(_, args, context) => {
            // Must be admin, or deleting your own
            if(!context.req.isAdmin || args.ids.length > 1 || context.req.token.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 
            return await context.prisma[_model].delete({
                where: { id: { in: args.ids } }
            })
        },
    }
}