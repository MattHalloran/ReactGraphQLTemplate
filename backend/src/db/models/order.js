import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';
import { ORDER_STATUS } from '@local/shared';

export const typeDef = gql`
    enum OrderStatus {
        CanceledByAdmin
        CanceledByUser
        PendingCancel
        Rejected
        Draft
        Pending
        Approved
        Scheduled
        InTransit
        Delivered
    }

    type Order {
        id: ID!
        status: OrderStatus!
        specialInstructions: String
        desiredDeliveryDate: Date
        expectedDeliveryDate: Date
        isDelivery: Boolean
        address: Address
        business: Business!
        items: [OrderItem!]!
    }

    extend type Query {
        order(id: ID!): Order
        orders(businessId: ID, status: OrderStatus): [Order!]!
    }

    extend type Mutation {
        updateOrder(
            id: ID!
            specialInstructions: String
            desiredDeliveryDate: Date
            isDelivery: Boolean
            addressId: ID
        ): Order
        submitOrder(
            id: ID!
        ): Response
        cancelOrder(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    OrderStatus: ORDER_STATUS
}