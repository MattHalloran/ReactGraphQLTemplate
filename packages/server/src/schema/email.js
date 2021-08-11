import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Email;

export const typeDef = gql`
    input EmailInput {
        id: ID
        emailAddress: String!
        receivesDeliveryUpdates: Boolean
        customerId: ID
        businessId: ID
    }

    type Email {
        id: ID!
        emailAddress: String!
        receivesDeliveryUpdates: Boolean!
        customer: Customer
        business: Business
    }

    extend type Query {
        emails: [Email!]!
    }

    extend type Mutation {
        addEmail(input: EmailInput!): Email!
        updateEmail(input: EmailInput!): Email!
        deleteEmails(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        emails: async (_, _args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addEmail: async (_, args, context, info) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin || (context.req.token.businessId !== args.input.businessId)) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create((new PrismaSelect(info).value), { data: { ...args.input } });
        },
        updateEmail: async (_, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await db(_model).where('id', args.input.id).first();
            if (context.req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update((new PrismaSelect(info).value), {
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deleteEmails: async (_, args, context, info) => {
            // Must be admin, or deleting your own
            // TODO must keep at least one email per customer
            let business_ids = await db(_model).select('businessId').whereIn('id', args.ids);
            business_ids = [...new Set(business_ids)];
            if (!context.req.isAdmin && (business_ids.length > 1 || context.req.token.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete((new PrismaSelect(info).value), {
                where: { id: { in: args.ids } }
            })
        }
    }
}