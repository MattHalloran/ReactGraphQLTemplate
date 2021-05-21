import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import pathExists from './pathExists';
import { CODE } from '@local/shared';

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
    
}