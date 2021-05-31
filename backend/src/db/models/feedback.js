import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { USER_FIELDS } from './user';

// Fields that can be exposed in a query
export const FEEDBACK_FIELDS = [
    'id',
    'text',
    'userId'
];

const relationships = [
    ['one', 'user', TABLES.User, USER_FIELDS, 'userId']
];

export const typeDef = gql`
    type Feedback {
        id: ID!
        text: String!
        user: User
    }

    extend type Query {
        feedbacks(ids: [ID!]): [Feedback!]!
    }

    extend type Mutation {
        addFeedback(
            id: ID!
            text: String!
            userId: ID
        ): Feedback!
        deleteFeedback(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    Query: {
        feedbacks: async (_, args, context, info) => {
            // Only admins can query feedbacks
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.Feedback, relationships);
        }
    }
}