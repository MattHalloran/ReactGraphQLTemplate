import { gql } from 'apollo-server-express';
import { TABLES } from '../db';
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
        deleteOrders(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    OrderStatus: ORDER_STATUS,
    Query: {
        orders: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany({
                where: { status: args.status },
                ...(new PrismaSelect(info).value)
            });
        }
    },
    Mutation: {
        updateOrder: async (_, args, context, info) => {
            // Must be admin, or updating your own
            console.log('UPDATING ORDER', args.input)
            const curr = await context.prisma[_model].findUnique({ 
                where: { id: args.input.id },
                select: { id: true, customerId: true, status: true, items: { select: { id: true } } }
            });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            if (!context.req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [ORDER_STATUS.Draft, ORDER_STATUS.Pending];
                if (!(curr.status in editable_order_statuses)) return new CustomError(CODE.Unauthorized);
                // Customers cannot edit order status
                delete args.input.status;
            }
            // Determine which order item rows need to be updated, and which will be deleted
            const updatedItemIds = args.input.items ? args.input.items.map(i => i.id) : [];
            const deletingItemIds = curr.items.filter(i => !updatedItemIds.includes(i.id)).map(i => i.id);
            if (args.input.items.length > 0) {
                const updateMany = args.input.items.map(d => context.prisma[TABLES.OrderItem].updateMany({
                    where: { id: d.id },
                    data: { ...d }
                }))
                Promise.all(updateMany)
            }
            if (deletingItemIds.length > 0) {
                await context.prisma[TABLES.OrderItem].deleteMany({ where: { id: { in: deletingItemIds }} })
            }
            console.log('about to update')
            return await context.prisma[_model].update({
                where: { id: curr.id },
                data: { ...args.input, items: undefined },
                ...(new PrismaSelect(info).value)
            })
        },
        submitOrder: async (_, args, context) => {
            // Must be admin, or submitting your own
            const curr = await context.prisma[_model].findUnique({ where: { id: args.id } });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only orders in the draft state can be submitted
            console.log('GOT ORDER DATA', curr);
            if (curr.status !== ORDER_STATUS.Draft) return new CustomError(CODE.ErrorUnknown);
            await context.prisma[_model].update({
                where: { id: curr.id },
                data: { status: ORDER_STATUS.Pending }
            });
            return true;
        },
        cancelOrder: async (_, args, context) => {
            // Must be admin, or canceling your own
            const curr = await context.prisma[_model].findUnique({ where: { id: args.id } });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            let order_status = curr.status;
            // Only pending orders can be fully cancelled by customer
            if (curr.status === ORDER_STATUS.Pending) {
                order_status = ORDER_STATUS.CanceledByCustomer;
            }
            const pending_order_statuses = [ORDER_STATUS.Approved, ORDER_STATUS.Scheduled];
            if (curr.status in pending_order_statuses) {
                order_status = ORDER_STATUS.PendingCancel;
            }
            await context.prisma[_model].update({
                where: { id: curr.id },
                data: { status: order_status }
            })
            return order_status;
        },
        deleteOrders: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}