import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE, ORDER_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Order;

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
        orders(status: OrderStatus): [Order!]!
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
        orders: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany({
                where: { status: args.status }
            });
        }
    },
    Mutation: {
        updateOrder: async (_, args, context) => {
            // Must be admin, or updating your own
            const curr = await db(_model).where('id', args.input.id).first();
            if (!context.req.isAdmin && context.req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            if (!context.req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [ORDER_STATUS.Draft, ORDER_STATUS.Pending];
                if (!(curr.status in editable_order_statuses)) return new CustomError(CODE.Unauthorized);
                // Customers cannot edit order status
                delete args.input.status;
            }
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        submitOrder: async (_, args, context) => {
            // Must be admin, or submitting your own
            const curr = await db(_model).where('id', args.id).first();
            if (!context.req.isAdmin && context.req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only orders in the draft state can be submitted
            if (curr.status !== ORDER_STATUS.Draft) return new CustomError(CODE.ErrorUnknown);
            await db(_model).where('id', curr.id).update('status', ORDER_STATUS.Pending);
            return true;
        },
        cancelOrder: async (_, args, context) => {
            // Must be admin, or canceling your own
            const curr = await db(_model).where('id', args.id).first();
            if (!context.req.isAdmin && context.req.token.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only pending orders in certain states
            if (curr.status === ORDER_STATUS.Pending) {
                await db(_model).where('id', curr.id).update('status', ORDER_STATUS.CanceledByCustomer);
                return ORDER_STATUS.CanceledByCustomer;
            }
            const pending_order_statuses = [ORDER_STATUS.Approved, ORDER_STATUS.Scheduled];
            if (curr.status in pending_order_statuses) {
                await db(_model).where('id', curr.id).update('status', ORDER_STATUS.PendingCancel);
                return ORDER_STATUS.PendingCancel;
            }
        },
        deleteOrders: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete({
                where: { id: { in: args.ids } }
            })
        }
    }
}