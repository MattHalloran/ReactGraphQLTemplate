import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { ORDER_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { OrderModel as Model } from '../relationships';

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
    OrderStatus: ORDER_STATUS,
    Query: {
        orders: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);

            let ids = args.ids;
            if (args.userIds !== null) {
                const ids_query = await db(TABLES.Order)
                    .select('id')
                    .whereIn('userId', args.userIds);
                ids = ids_query.filter(q => q.id);
            } else if (args.status !== null) {
                const ids_query = await db(TABLES.Order)
                    .select('id')
                    .where('status', args.status);
                ids = ids_query.filter(q => q.id);
            }
            return fullSelectQueryHelper(Model, info, ids);
        }
    },
    Mutation: {
        updateOrder: async (_, args, { req }, info) => {
            // Must be admin, or updating your own
            const curr = await db(Model.name).where('id', args.id).first();
            if (!req.isAdmin && req.token.user_id !== curr.userId) return new CustomError(CODE.Unauthorized);
            
            await updateHelper(Model, args, curr);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        submitOrder: async (_, args, { req, res }, info) => {
            // Must be admin, or submitting your own
            return new CustomError(CODE.NotImplemented);
        },
        cancelOrder: async (_, args, { req, res }, info) => {
            // Must be admin, or cancelling your own
            return new CustomError(CODE.NotImplemented);
        },
    }
}