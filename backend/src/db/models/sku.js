import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';
import { SKU_STATUS } from '@local/shared';

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
    SkuStatus: SKU_STATUS
}