import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { OrderItemModel as Model } from '../relationships';
import { deleteHelper, fullSelectQueryHelper, updateHelper } from '../query';

export const typeDef = gql`
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
        updateOrderItem(
            id: ID!
            quantity: Int
        ): OrderItem
        deleteOrderItems(
            ids: [ID!]!
        ): Boolean
    }
`

export const resolvers = {
    Mutation: {
        addOrderItem: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const user_id = await db(TABLES.Order).select('userId').where('id', args.orderId).first();
            if (req.token.userId !== user_id) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).insertAndFetch({
                quantity: args.quantity,
                orderId: args.orderId,
                skuId: args.skuId
            });
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateOrderItem: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            const user_id = await db(TABLES.Order)
                .select(`${TABLES.Order}.userId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .where(`${TABLES.OrderItem}.id`, args.id)
                .first();
            if (!req.isAdmin && req.token.userId !== user_id) return new CustomError(CODE.Unauthorized);

            await updateHelper(Model, args);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteOrderItems: async (_, args, { req }) => {
            // Must be admin, or deleting your own
            let user_ids = await db(TABLES.Order)
                .select(`${TABLES.Order}.userId`)
                .leftJoin(TABLES.OrderItem, `${TABLES.OrderItemModel}.orderId`, `${TABLES.Order}.id`)
                .whereIn(`${TABLES.OrderItem}.id`, args.ids);
            user_ids = [...new Set(user_ids)];
            if (!req.isAdmin && (user_ids.length > 1 || req.token.userId !== user_ids[0])) return new CustomError(CODE.Unauthorized);

            await deleteHelper(Model.name, args.ids);
        },
    }
}