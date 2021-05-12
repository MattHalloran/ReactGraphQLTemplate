import { GraphQLObjectType, GraphQLString } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { UserType } from './user';

export const FeedbackType = new GraphQLObjectType({
    name: 'Feedback',
    description: 'User-submitted feedback',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        test: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLString },
        user: {
            type: UserType,
            resolve: (feedback) => {
                return db().select().from(TABLES.User).where('id', feedback.userId).first();
            }
        }
    })
})