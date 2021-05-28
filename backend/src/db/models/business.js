import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';

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

const hydrate = (object) => ({
    ...object,
    // business: {

    // },
    // orders: {
        
    // }
})

export const resolvers = {
    Query: {
        businesses: async (_, args, context, info) => {
            if (!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);
            
            const qb = args.ids ? 
                    db(TABLES.Business).select().whereIn('id', args.ids) :
                    db(TABLES.Business).select();

            // if (pathExists(info.fieldNodes, [TABLES.Business, 'addresses'])) {
            //     qb.leftJoin(TABLES.Address, `${TABLES.Address}.id`, `${TABLES.Business}.id`);
            // }
            // if (pathExists(info.fieldNodes, [TABLES.Address, 'orders'])) {
            //     qb.leftJoin(TABLES.Order, `${TABLES.Order}.id`, `${TABLES.Address}.id`);
            // }

            const results = await qb;
            return results.map(r => hydrate(r));
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

            const curr = await db(TABLES.Business).findById(args.id);
            const updated = await db(TABLES.Business).patchAndFetchById(args.id, {
                name: args.name ?? curr.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? curr.subscribedToNewsletters
            })

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