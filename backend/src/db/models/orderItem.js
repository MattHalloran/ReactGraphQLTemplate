import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';

// Fields that can be exposed in a query
export const ORDER_ITEM_FIELDS = [
    'id',
    'quantity',
    'orderId',
    'skuId'
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