import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, insertJoinRowsHelper, updateHelper } from '../query';
import { DiscountModel as Model } from '../relationships';
import { TABLES } from '../tables';

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
            comment: String
            terms: String
            businessIds: [ID!]
            skuIds: [ID!]
        ): Discount!
        updateDiscount(
            id: ID!
            title: String
            discount: Float
            comment: String
            terms: String
            businessIds: [ID!]
            skuIds: [ID!]
        ): Response
        deleteDiscounts(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        discounts: async (_, args, { req }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addDiscount: async (_, args, { req }, info) => {
            // Only admins can add
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            
            const added = await db(Model.name).insertAndFetch({
                title: args.title,
                discount: args.discount,
                comment: args.comment ?? null,
                terms: args.terms ?? null,
            });
            await insertJoinRowsHelper(Model, 'businesses', added.id, args.businessIds);
            await insertJoinRowsHelper(Model, 'skus', added.id, args.skuIds);
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateDiscount: async (_, args, { req, res }) => {
            // Only admins can update
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);

            const updated = await updateHelper(Model, args, curr);
            if (args.businessIds) {
                return new CustomError(CODE.NotImplemented);
            }
            if (args.skuIds) {
                return new CustomError(CODE.NotImplemented);
            }
            return (await fullSelectQueryHelper(Model, info, [updated.id]))[0];
        },
        deleteDiscounts: async (_, args, { req, res }) => {
            // Only admins can delete
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}