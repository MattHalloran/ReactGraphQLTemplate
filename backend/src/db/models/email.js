import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { EMAIL_RELATIONSHIPS } from '../relationships';

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
        emails: async (_, args, context, info) => {
            // Only admins can query emails
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.Email, EMAIL_RELATIONSHIPS);
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