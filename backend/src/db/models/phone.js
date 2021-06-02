import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { PHONE_RELATIONSHIPS } from '../relationships';

export const typeDef = gql`
    type Phone {
        id: ID!
        number: String!
        countryCode: String!
        extension: String
        receivesDeliveryUpdates: Boolean!
        user: User
        business: Business
    }

    extend type Query {
        phones(ids: [ID!]): [Phone!]!
    }

    extend type Mutation {
        addPhone(
            number: String!
            countryCode: String!
            extension: String
            receivesDeliveryUpdates: Boolean, 
            userId: ID, 
            businessID: ID
        ): Phone!
        updatePhone(
            id: ID!
            number: String
            countryCode: String
            extension: String
            receivesDeliveryUpdates: Boolean, 
            userId: ID, 
            businessID: ID
        ): Response
        deletePhone(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    Query: {
        phones: async (_, args, context, info) => {
            // Only admins can query phones
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(info, TABLES.Phone, args.ids, PHONE_RELATIONSHIPS);
        }
    },
    Mutation: {
        addPhone: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updatePhone: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deletePhone: async (_, args, context, info) => {
            return CustomError(CODE.NotImplemented);
        },
    }
}