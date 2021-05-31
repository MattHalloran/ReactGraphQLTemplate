import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { ORDER_FIELDS } from './order';
import { SKU_FIELDS } from './sku';

// Fields that can be exposed in a query
export const ORDER_ITEM_FIELDS = [
    'id',
    'quantity',
    'orderId',
    'skuId'
];

const relationships = [
    ['one', 'order', TABLES.Order, ORDER_FIELDS, 'orderId'],
    ['one', 'sku', TABLES.Sku, SKU_FIELDS, 'skuId']
];

export const typeDef = gql`
    type OrderItem {
        id: ID!
        quantity: Int!
        order: Order!
        sku: Sku!
    }

    extend type Mutation {
        addOrderItem(
            quantity: Int!
            orderId: ID!
            skuId: ID!
        ): OrderItem
        updateOrderItem(
            id: ID!
            quantity: Int
        ): OrderItem
        deleteOrderItem(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    
}