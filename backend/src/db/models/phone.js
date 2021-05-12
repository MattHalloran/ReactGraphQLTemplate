import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { BusinessType } from './business';
import { UserType } from './user';

export const PhoneType = new GraphQLObjectType({
    name: 'Phone',
    description: 'A phone number',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        number: { type: GraphQLNonNull(GraphQLString) },
        countryCode: { type: GraphQLNonNull(GraphQLString) },
        extension: { type: GraphQLNonNull(GraphQLString) },
        receivesDeliveryUpdates: { type: GraphQLBoolean },
        userId: { type: GraphQLString },
        businessId: { type: GraphQLString },
        user: {
            type: UserType,
            resolve: (phone) => {
                return db().select().from(TABLES.User).where('id', phone.userId).first();
            }
        },
        business: {
            type: BusinessType,
            resolve: (phone) => {
                return db().select().from(TABLES.Business).where('id', phone.userId).first();
            }
        },
    })
})