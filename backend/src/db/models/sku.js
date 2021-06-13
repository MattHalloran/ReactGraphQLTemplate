import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper } from '../query';
import { SkuModel as Model } from '../relationships';

export const typeDef = gql`
    enum SkuStatus {
        Deleted
        Inactive
        Active
    }

    type Sku {
        id: ID!
        sku: String!
        isDiscountable: Boolean!
        size: String!
        note: String
        availability: Int!
        price: String!
        status: SkuStatus!
        plant: Plant!
        discounts: [Discount!]!
    }

    extend type Query {
        skus(ids: [ID!]): [Sku!]!
    }

    extend type Mutation {
        addSku(
            sku: String!
            isDiscountable: Boolean
            size: String
            note: String
            availability: Int
            price: String
            status: SkuStatus
            plantId: ID
            discountIds: [ID!]
        ): Sku!
        updateSku(
            id: ID!
            sku: String
            isDiscountable: Boolean
            size: String
            note: String
            availability: Int
            price: String
            status: SkuStatus
            plantId: ID
            discountIds: [ID!]
        ): Sku!
        deleteSkus(
            ids: [ID!]!
        ): Boolean
    }
`

export const resolvers = {
    SkuStatus: SKU_STATUS,
    Query: {
        skus: async (_, args, _c, info) => {
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).insertAndFetch({
                sku: args.sku,
                isDiscountable: args.isDiscountable ?? false,
                size: args.size ?? 'N/A',
                note: args.note ?? null,
                availability: args.availability ?? 0,
                price: args.price ?? 'N/A',
                status: args.status ?? SKU_STATUS.Active,
                plantId: args.plantId ?? null,
            });
            await insertJoinRowsHelper(Model, 'discounts', added.id, args.discountIds);
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            await updateHelper(Model, args);
            await updateJoinRowsHelper(Model, 'discounts', args.id, args.discountIds);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteSkus: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}