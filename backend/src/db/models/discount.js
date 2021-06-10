import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { DiscountModel as Model } from '../relationships';

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
        discounts: async (_, args, {req, res}, info) => {
            // Only admins can query addresses
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addDiscount: async (_, args, {req, res}, info) => {
            // Only admins can add discounts
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        updateDiscount: async (_, args, {req, res}, info) => {
            // Only admins can add discounts
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        deleteDiscount: async (_, args, {req, res}, info) => {
            // Only admins can add discounts
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        },
        setDiscountAssociations: async (_, args, {req, res}, info) => {
            // Only admins can add discounts
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return CustomError(CODE.NotImplemented);
        }
    }
}