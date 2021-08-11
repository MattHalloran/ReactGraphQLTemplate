import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Feedback;

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
        feedbacks: [Feedback!]!
    }

    extend type Mutation {
        addFeedback(input: FeedbackInput!): Feedback!
        deleteFeedbacks(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        feedbacks: async (_, _args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addFeedback: async (_, args, context, info) => {
            return await context.prisma[_model].create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        deleteFeedbacks: async (_, args, context, info) => {
            // Must be admin, or deleting your own
            let customer_ids = await db(_model).select('customerId').whereIn('id', args.ids);
            customer_ids = [...new Set(customer_ids)];
            if (!context.req.isAdmin && (customer_ids.length > 1 || context.req.token.customerId !== customer_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].delete((new PrismaSelect(info).value), {
                where: { id: { in: args.ids } }
            })
        }
    }
}