import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { PLANT_FIELDS } from './plant';
import { DISCOUNT_FIELDS } from './discount';

// Fields that can be exposed in a query
export const SKU_FIELDS = [
    'id',
    'sku',
    'isDiscountable',
    'size',
    'note',
    'availability',
    'price',
    'status',
    'plantId'
];

const relationships = [
    ['one', 'plant', TABLES.Plant, PLANT_FIELDS, 'plantId'],
    ['many-many', 'discounts', TABLES.Discount, TABLES.SkuDiscounts, DISCOUNT_FIELDS, 'skuId', 'discountId']
];

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