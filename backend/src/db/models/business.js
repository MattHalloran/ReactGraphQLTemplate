import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { BUSINESS_RELATIONSHIPS } from '../relationships';

export const typeDef = gql`
    type Business {
        id: ID!
        name: String!
        subscribedToNewsletters: Boolean!
        addresses: [Address!]!
        phones: [Phone!]!
        emails: [Email!]!
        employees: [User!]!
        discounts: [Discount!]!
    }

    extend type Query {
        businesses(ids: [ID!]): [Business!]!
    }

    extend type Mutation {
        addBusiness(
            name: String!
            subscribedToNewsletters: Boolean
        ): Business!
        updateBusiness(
            name: String
            subscribedToNewsletters: Boolean
        ): Business!
        deleteBusinesses(
            ids: [ID!]!
        ): Response
        setBusinessDiscounts(
            ids: [ID!]!
        ): Response
        setBusinessEmployees(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, args, context, info) => {
            // Only admins can query addresses
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.Business, BUSINESS_RELATIONSHIPS);
        }
    },
    Mutation: {
        addBusiness: async(_, args, context) => {
            // Only admins can directly add businesses
            //if(!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);

            const added = await db(TABLES.Business).returning('*').insert({
                name: args.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? false
            })

            return added;
        },
        updateBusiness: async(_, args, context) => {
            // Only admins can update other businesses
            if(!context.req.isAdmin || (context.token.businessId !== args.id)) return context.res.sendStatus(CODE.Unauthorized);

            const curr = await db(TABLES.Business).where('id', args.id).first();
            const updated = await db(TABLES.Business).where('id', args.id).update({
                name: args.name ?? curr.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? curr.subscribedToNewsletters
            }).returning('*');

            return updated;
        },
        deleteBusinesses: async(_, args, context) => {
            // Only admins can delete other businesses
            if(!context.req.isAdmin || args.ids.length > 1 || context.token.businessId !== args.ids[0]) return context.res.sendStatus(CODE.Unauthorized); 

            const numDeleted = await db(TABLES.Address).delete().whereIn('id', args.ids);

            return context.res.sendStatus(numDeleted > 0 ? CODE.Success : CODE.ErrorUnknown);
        },
        setBusinessDiscounts: async(_, args, context) => {
            // TODO
            return context.res.sendStatus(CODE.NotImplemented);
        },
        setBusinessEmployees: async(_, args, context) => {
            // TODO
            return context.res.sendStatus(CODE.NotImplemented);
        }
    }
}