import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE, ORDER_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { 
    deleteHelper, 
    fullSelectQueryHelper, 
    updateHelper
} from '../query';
import { OrderModel as Model } from '../relationships';

export const typeDef = gql`
    enum OrderStatus {
        CanceledByAdmin
        CanceledByCustomer
        PendingCancel
        Rejected
        Draft
        Pending
        Approved
        Scheduled
        InTransit
        Delivered
    }

    input OrderInput {
        id: ID
        status: OrderStatus
        specialInstructions: String
        desiredDeliveryDate: Date
        isDelivery: Boolean
        items: [OrderItemInput!]
    }

    type Order {
        id: ID!
        status: OrderStatus!
        specialInstructions: String
        desiredDeliveryDate: Date
        expectedDeliveryDate: Date
        isDelivery: Boolean
        address: Address
        customer: Customer!
        items: [OrderItem!]!
    }

    extend type Query {
        orders(ids: [ID!], customerIds: [ID!], status: OrderStatus): [Order!]!
    }

    extend type Mutation {
        updateOrder(input: OrderInput): Order!
        submitOrder(id: ID!): Boolean
        cancelOrder(id: ID!): OrderStatus
        deleteOrders(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    OrderStatus: ORDER_STATUS,
    Query: {
        orders: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);

            let ids = args.ids;
            if (args.customerIds !== null) {
                const ids_query = await db(TABLES.Order)
                    .select('id')
                    .whereIn('customerId', args.customerIds);
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
            const curr = await db(Model.name).where('id', args.input.id).first();
            if (!req.isAdmin && req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            if (!req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [ORDER_STATUS.Draft, ORDER_STATUS.Pending];
                if (!(curr.status in editable_order_statuses)) return new CustomError(CODE.Unauthorized);
                // Customers cannot edit order status
                delete args.input.status;
            }
            return await updateHelper({ model: Model, info: info, input: args.input});
        },
        submitOrder: async (_, args, { req }) => {
            // Must be admin, or submitting your own
            const curr = await db(Model.name).where('id', args.id).first();
            if (!req.isAdmin && req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only orders in the draft state can be submitted
            if (curr.status !== ORDER_STATUS.Draft) return new CustomError(CODE.ErrorUnknown);
            await db(Model.name).where('id', curr.id).update('status', ORDER_STATUS.Pending);
            return true;
        },
        cancelOrder: async (_, args, { req }) => {
            // Must be admin, or canceling your own
            const curr = await db(Model.name).where('id', args.id).first();
            if (!req.isAdmin && req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only pending orders in certain states
            if (curr.status === ORDER_STATUS.Pending) {
                await db(Model.name).where('id', curr.id).update('status', ORDER_STATUS.CanceledByCustomer);
                return ORDER_STATUS.CanceledByCustomer;
            }
            const pending_order_statuses = [ORDER_STATUS.Approved, ORDER_STATUS.Scheduled];
            if (curr.status in pending_order_statuses) {
                await db(Model.name).where('id', curr.id).update('status', ORDER_STATUS.PendingCancel);
                return ORDER_STATUS.PendingCancel;
            }
        },
        deleteOrders: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}