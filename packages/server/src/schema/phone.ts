import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

export const typeDef = gql`
    input PhoneInput {
        id: ID
        number: String!
        receivesDeliveryUpdates: Boolean, 
        customerId: ID, 
        businessID: ID
    }

    type Phone {
        id: ID!
        number: String!
        receivesDeliveryUpdates: Boolean!
        customer: Customer
        business: Business
    }

    extend type Query {
        phones: [Phone!]!
    }

    extend type Mutation {
        addPhone(input: PhoneInput!): Phone!
        updatePhone(input: PhoneInput!): Phone!
        deletePhones(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Query: {
        phones: async (_parent: undefined, _args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.phone.findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addPhone: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin || (context.req.businessId !== args.input.businessId)) return new CustomError(CODE.Unauthorized);
            return await context.prisma.phone.create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updatePhone: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await context.prisma.phone.findUnique({ where: { id: args.input.id } });
            if (context.req.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);
            return await context.prisma.phone.update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deletePhones: async (_parent: undefined, args: any, context: any, _info: any) => {
            // Must be admin, or deleting your own
            // TODO must leave one phone per customer
            const specified = await context.prisma.phone.findMany({ where: { id: { in: args.ids } } });
            if (!specified) return new CustomError(CODE.ErrorUnknown);
            const business_ids = [...new Set(specified.map(s => s.businessId))];
            if (!context.req.isAdmin && (business_ids.length > 1 || context.req.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma.phone.deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}