import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { OrderType } from './order';

export const OrderItemType = new GraphQLObjectType({
    name: 'Order Item',
    description: 'One item (with quantity) in an order',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        quantity: { type: GraphQLInt },
        orderId: { type: GraphQLNonNull(GraphQLString) },
        skuId: { type: GraphQLNonNull(GraphQLString) },
        order: {
            type: OrderType,
            resolve: (orderItem) => {
                return db().select().from(TABLES.Order).where('id', orderItem.orderId).first();
            }
        },
        sku: {
            type: SkuType,
            resolve: (orderItem) => {
                return db().select().from(TABLES.Sku).where('id', orderItem.skuId).first();
            }
        }
    })
})