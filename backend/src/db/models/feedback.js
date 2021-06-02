import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { FEEDBACK_RELATIONSHIPS } from '../relationships';

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
            return fullSelectQueryHelper(info, TABLES.Feedback, args.ids, FEEDBACK_RELATIONSHIPS);
        }
    },
    Mutation: {
        addFeedback: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteFeedback: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        }
    }
}