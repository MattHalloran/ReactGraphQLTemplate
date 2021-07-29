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
        id: ID
        text: String!
        customerId: ID
    }

    type Feedback {
        id: ID!
        text: String!
        customer: Customer
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
            let customer_ids = await db(Model.name).select('customerId').whereIn('id', args.ids);
            customer_ids = [...new Set(customer_ids)];
            if (!req.isAdmin && (customer_ids.length > 1 || req.token.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}