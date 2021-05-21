import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import pathExists from './pathExists';
import { CODE } from '@local/shared';

export const typeDef = gql`
    type Discount {
        id: ID!
        discount: Float!
        title: String!
        comment: String
        terms: String
        businesses: [Business!]!
        skus: [Sku!]!
    }

    extend type Query {
        discounts(ids: [ID!]): [Discount!]!
    }

    extend type Mutation {
        addDiscount(
            title: String!
            discount: Float!
        ): Discount!
        updateDiscount(
            id: ID!
            title: String
            discount: Float
            comment: String
            terms: String
        ): Response
        deleteDiscount(
            id: ID!
        ): Response
        setDiscountAssociations(
            discountId: ID!
            businessIds: [ID!]!
            skuIds: [ID!]!
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
        discounts: async (_, args, context, info) => {
            if (!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);
            
            const qb = args.ids ? 
                    db(TABLES.Discount).select().whereIn('id', args.ids) :
                    db(TABLES.Discount).select();

            // if (pathExists(info.fieldNodes, [TABLES.Address, 'business'])) {
            //     qb.leftJoin(TABLES.Business, `${TABLES.Business}.id`, `${TABLES.Address}.businessId`).first();
            // }
            // if (pathExists(info.fieldNodes, [TABLES.Address, 'orders'])) {
            //     qb.leftJoin(TABLES.Order, `${TABLES.Order}.addressId`, `${TABLES.Address}.id`);
            // }

            const results = await qb;
            return results.map(r => hydrate(r));
        }
    }
}