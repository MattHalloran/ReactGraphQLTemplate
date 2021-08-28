import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE, ORDER_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.OrderItem;

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
        addOrderItem(
            quantity: Int!
            orderId: ID
            skuId: ID!
        ): OrderItem!
        updateOrderItem(input: OrderItemInput!): OrderItem!
        deleteOrderItems(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Mutation: {
        addOrderItem: async (_, args, context, info) => {
            // Must be signed in
            if (!context.req.customerId) return new CustomError(CODE.Unauthorized);
            // If no orderId, find or create a new order
            let order;
            if (!args.orderId) {
                const cartData = { customerId: context.req.customerId, status: ORDER_STATUS.Draft };
                // Find current cart
                order = await context.prisma[TABLES.Order].findUnique({ where: cartData})
                // If cart not found, create a new one
                if (!order) order = await context.prisma[TABLES.Order].create({ data: cartData})
            } else {
                order = await context.prisma[TABLES.Order].findUnique({ where: { id: args.orderId } });
            }
            // Must be admin, or updating your own
            if (!context.req.isAdmin && context.req.customerId !== order.customerId) return new CustomError(CODE.Unauthorized);
            if (!context.req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [ORDER_STATUS.Draft, ORDER_STATUS.Pending];
                if (!(curr.status in editable_order_statuses)) return new CustomError(CODE.Unauthorized);
            }
            console.log('CREATING ORDR ITEM')
            return await context.prisma[_model].create({ data: { 
                quantity: args.quantity, 
                orderId: args.orderId, 
                skuId: args.skuId 
            }, ...(new PrismaSelect(info).value) });
        },
        updateOrderItem: async (_, args, context, info) => {
            // Must be admin, or adding to your own
            const customer_id = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .where(`${TABLES.OrderItem}.id`, args.input.id)
                .first();
            if (!context.req.isAdmin && context.req.customerId !== customer_id) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteOrderItems: async (_, args, context) => {
            // Must be admin, or deleting your own
            let customer_ids = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .whereIn(`${TABLES.OrderItem}.id`, args.ids);
            customer_ids = [...new Set(customer_ids)];
            if (!context.req.isAdmin && (customer_ids.length > 1 || context.req.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}