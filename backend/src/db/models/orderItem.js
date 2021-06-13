import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';

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
    Mutation: {
        addOrderItem: async (_, args, { req, res }) => {
            return CustomError(CODE.NotImplemented);
        },
        updateOrderItem: async (_, args, { req, res }) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteOrderItem: async (_, args, { req, res }) => {
            return CustomError(CODE.NotImplemented);
        },
    }
}