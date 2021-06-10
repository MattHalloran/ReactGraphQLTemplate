import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { EmailModel as Model } from '../relationships';

export const typeDef = gql`
    type Email {
        id: ID!
        emailAddress: String!
        receivesDeliveryUpdates: Boolean!
        user: User
        business: Business
    }

    extend type Query {
        emails(ids: [ID!]): [Email!]!
    }

    extend type Mutation {
        addEmail(
            emailAddress: String!
            receivesDeliveryUpdates: Boolean
            userId: ID
            businessID: ID
        ): Email!
        updateEmail(
            receivesDeliveryUpdates: Boolean!
        ): Response
        deleteEmail(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    Query: {
        emails: async (_, args, {req, res}, info) => {
            // Only admins can query emails
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addEmail: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updateEmail: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteEmail: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        }
    }
}