import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { BUSINESS_FIELDS } from './business';
import { SKU_FIELDS } from './sku';

// Fields that can be exposed in a query
export const DISCOUNT_FIELDS = [
    'id',
    'discount',
    'title',
    'comment',
    'terms'
];

const relationships = [
    ['many-many', 'businesses', TABLES.Business, TABLES.BusinessDiscounts, BUSINESS_FIELDS, 'discountId', 'businessId'],
    ['many-many', 'skus', TABLES.Sku, TABLES.SkuDiscounts, SKU_FIELDS, 'discountId', 'skuId']
];

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

export const resolvers = {
    Query: {
        discounts: async (_, args, context, info) => {
            // Only admins can query addresses
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.User, relationships);
        }
    }
}