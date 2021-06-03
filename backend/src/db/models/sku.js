import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
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
            discounts: [ID!]
        ): Sku!
        deleteSku(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    SkuStatus: SKU_STATUS,
    Query: {
        skus: async (_, args, context, info) => {
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addSku: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updateSku: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteSku: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        }
    }
}