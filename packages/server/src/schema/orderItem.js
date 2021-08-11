import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';

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
            orderId: ID!
            skuId: ID!
        ): OrderItem
        updateOrderItem(input: OrderItemInput!): OrderItem
        deleteOrderItems(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Mutation: {
        addOrderItem: async (_, args, context) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            const customer_id = await db(TABLES.Order).select('customerId').where('id', args.orderId).first();
            if (context.req.token.customerId !== customer_id) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create({ data: { quantity: quantity, orderId: orderId, skuId: skuId } });
        },
        updateOrderItem: async (_, args, context) => {
            // Must be admin, or adding to your own
            const customer_id = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .where(`${TABLES.OrderItem}.id`, args.input.id)
                .first();
            if (!context.req.isAdmin && context.req.token.customerId !== customer_id) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
        },
        deleteOrderItems: async (_, args, context) => {
            // Must be admin, or deleting your own
            let customer_ids = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .whereIn(`${TABLES.OrderItem}.id`, args.ids);
            customer_ids = [...new Set(customer_ids)];
            if (!context.req.isAdmin && (customer_ids.length > 1 || context.req.token.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete({
                where: { id: { in: args.ids } }
            })
        },
    }
}