import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';
import pkg from '@prisma/client';
const { OrderStatus } = pkg;

export const typeDef = gql`

    input OrderItemInput {
        id: ID!
        quantity: Int
    }

    type OrderItem {
        id: ID!
        quantity: Int!
        order: Order!
        sku: Sku!
    }

    extend type Mutation {
        upsertOrderItem(
            quantity: Int!
            orderId: ID
            skuId: ID!
        ): OrderItem!
        deleteOrderItems(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Mutation: {
        upsertOrderItem: async (_parent, args, context, info) => {
            // Must be signed in
            if (!context.req.customerId) return new CustomError(CODE.Unauthorized);
            // If no orderId, find or create a new order
            let order;
            if (!args.orderId) {
                const cartData = { customerId: context.req.customerId, status: OrderStatus.DRAFT };
                // Find current cart
                const matchingOrders = await context.prisma.order.findMany({ where: {
                    AND: [
                        { customerId: cartData.customerId },
                        { status: cartData.status}
                    ]
                }})
                // If cart not found, create a new one
                if (matchingOrders.length > 0) order = matchingOrders[0];
                else order = await context.prisma.order.create({ data: cartData});
            } else {
                order = await context.prisma.order.findUnique({ where: { id: args.orderId } });
            }
            // Must be admin, or updating your own
            if (!context.req.isAdmin && context.req.customerId !== order.customerId) return new CustomError(CODE.Unauthorized);
            if (!context.req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [OrderStatus.DRAFT, OrderStatus.PENDING];
                if (!editable_order_statuses.includes(order.status)) return new CustomError(CODE.Unauthorized);
            }
            // Add to existing order item, or create a new one
            return await context.prisma.order_item.upsert({
                where: { order_item_orderid_skuid_unique: { orderId: order.id, skuId: args.skuId } },
                create: { orderId: order.id, skuId: args.skuId, quantity: args.quantity },
                update: { quantity: { increment: args.quantity } },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteOrderItems: async (_parent, args, context, _info) => {
            // Must be admin, or deleting your own
            let customer_ids = await context.prisma.customer.findMany({ 
                where: { orders: { items: { id: { in: args.ids } } } },
                select: { id: true }
            });
            customer_ids = [...new Set(customer_ids)];
            if (!context.req.isAdmin && (customer_ids.length > 1 || context.req.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma.order_item.deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}