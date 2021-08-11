import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Phone;

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
        deletePhones(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        phones: async (_, _args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addPhone: async (_, args, context, info) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin || (context.req.token.businessId !== args.input.businessId)) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updatePhone: async (_, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await db(_model).where('id', args.input.id).first();
            if (context.req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update((new PrismaSelect(info).value), {
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deletePhones: async (_, args, context, info) => {
            // Must be admin, or deleting your own
            // TODO must leave one phone per customer
            let business_ids = await db(_model).select('businessId').whereIn('id', args.ids);
            business_ids = [...new Set(business_ids)];
            if (!context.req.isAdmin && (business_ids.length > 1 || context.req.token.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete((new PrismaSelect(info).value), {
                where: { id: { in: args.ids } }
            })
        },
    }
}