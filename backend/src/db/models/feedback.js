import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper } from '../query';
import { FeedbackModel as Model } from '../relationships';

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
            text: String!
            userId: ID
        ): Feedback!
        deleteFeedbacks(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        feedbacks: async (_, args, { req }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addFeedback: async (_, args, _c, info) => {
            const added = await db(Model.name).insertAndFetch({
                text: args.text,
                userId: args.userId
            });
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        deleteFeedbacks: async (_, args, { req }) => {
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}