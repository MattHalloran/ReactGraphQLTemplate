import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

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
        deleteBusinesses(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Query: {
        businesses: async (_parent: undefined, _args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.business.findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addBusiness: async(_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.business.create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updateBusiness: async(_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin || (context.req.businessId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            return await context.prisma.business.update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteBusinesses: async(_parent: undefined, args: any, context: any, _info: any) => {
            // Must be admin, or deleting your own
            if(!context.req.isAdmin || args.ids.length > 1 || context.req.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 
            return await context.prisma.business.deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}