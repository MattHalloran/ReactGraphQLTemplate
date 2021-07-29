import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { OrderItemModel as Model } from '../relationships';
import { 
    insertHelper, 
    deleteHelper,
    updateHelper
} from '../query';

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
        addOrderItem: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const customer_id = await db(TABLES.Order).select('customerId').where('id', args.orderId).first();
            if (req.token.customerId !== customer_id) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args });
        },
        updateOrderItem: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            const customer_id = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .where(`${TABLES.OrderItem}.id`, args.input.id)
                .first();
            if (!req.isAdmin && req.token.customerId !== customer_id) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, input: args.input });
        },
        deleteOrderItems: async (_, args, { req }) => {
            // Must be admin, or deleting your own
            let customer_ids = await db(TABLES.Order)
                .select(`${TABLES.Order}.customerId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .whereIn(`${TABLES.OrderItem}.id`, args.ids);
            customer_ids = [...new Set(customer_ids)];
            if (!req.isAdmin && (customer_ids.length > 1 || req.token.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            await deleteHelper(Model.name, args.ids);
        },
    }
}