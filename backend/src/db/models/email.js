import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { BusinessType } from './business';
import { UserType } from './user';

export const EmailType = new GraphQLObjectType({
    name: 'Email',
    description: 'An email address',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        emailAddress: { type: GraphQLNonNull(GraphQLString) },
        receivesDeliveryUpdates: { type: GraphQLBoolean },
        userId: { type: GraphQLString },
        businessId: { type: GraphQLString },
        user: {
            type: UserType,
            resolve: (email) => {
                return db().select().from(TABLES.User).where('id', email.userId).first();
            }
        },
        business: {
            type: BusinessType,
            resolve: (email) => {
                return db().select().from(TABLES.Business).where('id', email.userId).first();
            }
        },
    })
})