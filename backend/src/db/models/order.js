import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { ORDER_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { ADDRESS_FIELDS } from './address';
import { USER_FIELDS } from './user';

// Fields that can be exposed in a query
export const ORDER_FIELDS = [
    'id',
    'status',
    'specialInstructions',
    'desiredDeliveryDate',
    'expectedDeliveryDate',
    'isDelivery',
    'addressId',
    'userId'
];

const relationships = [
    ['one', 'address', TABLES.Address, ADDRESS_FIELDS, 'addressId'],
    ['one', 'user', TABLES.User, USER_FIELDS, 'userId']
];

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
        user: User!
        items: [OrderItem!]!
    }

    extend type Query {
        orders(ids: [ID!], userIds: [ID!], status: OrderStatus): [Order!]!
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