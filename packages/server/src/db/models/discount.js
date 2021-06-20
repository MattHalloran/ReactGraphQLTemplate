import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, insertJoinRowsHelper, updateHelper, updateJoinRowsHelper } from '../query';
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
        ): Boolean
    }
`

export const resolvers = {
    Query: {
        discounts: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addDiscount: async (_, args, { req }, info) => {
            // Must be admin
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
        updateDiscount: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);

            await updateHelper(Model, args, curr);
            await updateJoinRowsHelper(Model, 'businesses', args.id, args.businessIds);
            await updateJoinRowsHelper(Model, 'skus', args.id, args.skuIds);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteDiscounts: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}