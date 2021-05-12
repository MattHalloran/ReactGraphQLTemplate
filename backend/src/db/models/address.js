import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { BusinessType } from './business';
import { OrderType } from './order';

export const AddressType = new GraphQLObjectType({
    name: 'Address',
    description: 'A physical address, used for delivery',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        tag: { type: GraphQLString },
        name: { type: GraphQLString },
        country: { type: GraphQLNonNull(GraphQLString) },
        administrativeArea: { type: GraphQLNonNull(GraphQLString) },
        subAdministrativeArea: { type: GraphQLString },
        locality: { type: GraphQLNonNull(GraphQLString) },
        postalCode: { type: GraphQLNonNull(GraphQLString) },
        throughfare: { type: GraphQLNonNull(GraphQLString) },
        premise: { type: GraphQLString },
        deliveryInstructions: { type: GraphQLString },
        businessId: { type: GraphQLNonNull(GraphQLString) },
        business: {
            type: BusinessType,
            resolve: (address) => {
                return db().select().from(TABLES.Business).where('id', address.businessId).first();
            }
        },
        orders: {
            type: GraphQLList(OrderType),
            resolve: (address) => {
                return db().select().from(TABLES.Order).where('addressId', address.id);
            }
        }
    })
})