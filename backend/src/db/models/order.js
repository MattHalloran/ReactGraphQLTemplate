import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { OrderStatusType } from '../enums/orderStatus';
import { TABLES } from '../tables';
import { AddressType } from './address';
import { OrderItemType } from './orderItem';
import { UserType } from './user';

export const OrderType = new GraphQLObjectType({
    name: 'Order',
    description: 'A customer order',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLNonNull(OrderStatusType) },
        specialInstructions: { type: GraphQLString },
        desiredDeliveryDate: { type: GraphQLInt },
        expectedDeliveryDate: { type: GraphQLInt },
        isDelivery: { type: GraphQLBoolean },
        addressId: { type: GraphQLInt },
        userId: { type: GraphQLNonNull(GraphQLString) },
        address: {
            type: AddressType,
            resolve: (order) => {
                return db().select().from(TABLES.Address).where('id', order.addressId).first();
            }
        },
        user: {
            type: UserType,
            resolve: (order) => {
                return db().select().from(TABLES.User).where('id', order.userId).first();
            }
        },
        items: {
            type: GraphQLList(OrderItemType),
            resolve: (order) => {
                return db().select().from(TABLES.OrderItem).where('orderId', order.id);
            }
        }
    })
})