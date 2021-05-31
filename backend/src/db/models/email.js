import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { USER_FIELDS } from './user';
import { BUSINESS_FIELDS } from './business';

// Fields that can be exposed in a query
export const EMAIL_FIELDS = [
    'id',
    'emailAddress',
    'receivesDeliveryUpdates',
    'userId',
    'businessId'
];

const relationships = [
    ['one', 'user', TABLES.User, USER_FIELDS, 'userId'],
    ['one', 'business', TABLES.Business, BUSINESS_FIELDS, 'emailId']
];

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
            return fullSelectQuery(info, args.ids, TABLES.Email, relationships);
        }
    }
}