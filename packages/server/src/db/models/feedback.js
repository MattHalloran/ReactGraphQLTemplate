import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper
} from '../query';
import { FeedbackModel as Model } from '../relationships';

export const typeDef = gql`
    input FeedbackInput {
        text: String!
        userId: ID
    }

    type Feedback {
        id: ID!
        text: String!
        user: User
    }

    extend type Query {
        feedbacks(ids: [ID!]): [Feedback!]!
    }

    extend type Mutation {
        addFeedback(input: FeedbackInput!): Feedback!
        deleteFeedbacks(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        feedbacks: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addFeedback: async (_, args, _c, info) => {
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        deleteFeedbacks: async (_, args, { req }) => {
            // Must be admin, or deleting your own
            let user_ids = await db(Model.name).select('userId').whereIn('id', args.ids);
            user_ids = [...new Set(user_ids)];
            if (!req.isAdmin && (user_ids.length > 1 || req.token.user_id !== user_ids[0])) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}