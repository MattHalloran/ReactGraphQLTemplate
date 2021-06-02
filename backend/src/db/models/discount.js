import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { DISCOUNT_RELATIONSHIPS } from '../relationships';

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
            return fullSelectQueryHelper(info, TABLES.Discount, args.ids, DISCOUNT_RELATIONSHIPS);
        }
    },
    Mutation: {
        addDiscount: async (_, args, context, info) => {
            // Only admins can add discounts
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        updateDiscount: async (_, args, context, info) => {
            // Only admins can add discounts
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        deleteDiscount: async (_, args, context, info) => {
            // Only admins can add discounts
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        setDiscountAssociations: async (_, args, context, info) => {
            // Only admins can add discounts
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        }
    }
}