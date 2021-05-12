import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { BusinessType } from './business';
import { UserStatusType } from '../enums/userStatus';
import { FeedbackType } from './feedback';
import { EmailType } from './email';
import { OrderType } from './order';
import { RoleType } from './role';
import { PhoneType } from './phone';

export const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'A user associated with an account',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        firstName: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        pronouns: { type: GraphQLString },
        theme: { type: GraphQLString },
        password: { type: GraphQLNonNull(GraphQLString) },
        accountApproved: { type: GraphQLNonNull(GraphQLBoolean) },
        emailVerified: { type: GraphQLNonNull(GraphQLBoolean) },
        status: { type: GraphQLNonNull(UserStatusType) },
        businessId: { type: GraphQLNonNull(GraphQLInt) },
        business: {
            type: BusinessType,
            resolve: (user) => {
                return db().select().from(TABLES.Business).where('id', user.businessId).first();
            }
        },
        phones: {
            type: GraphQLList(PhoneType),
            resolve: (user) => {
                return db().select().from(TABLES.Phone).where('userId', user.id);
            }
        },
        emails: {
            type: GraphQLList(EmailType),
            resolve: (user) => {
                return db().select().from(TABLES.Email).where('userId', user.id);
            }
        },
        orders: {
            type: GraphQLList(OrderType),
            resolve: (user) => {
                return db().select().from(TABLES.Order).where('userId', user.id);
            }
        },
        roles: {
            type: GraphQLList(RoleType),
            resolve: (user) => {
                return db().select().from(TABLES.UserRoles).where('userId', user.id);
            }
        },
        feedbacks: {
            type: GraphQLList(FeedbackType),
            resolve: (user) => {
                return db().select().from(TABLES.Feedback).where('userId', user.id);
            }
        }
    })
})