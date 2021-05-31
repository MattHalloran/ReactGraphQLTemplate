import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { USER_FIELDS } from './user';
import { BUSINESS_FIELDS } from './business';

// Fields that can be exposed in a query
export const PHONE_FIELDS = [
    'id',
    'number',
    'countryCode',
    'extension',
    'receivesDeliveryUpdates',
    'userId',
    'businessId'
];

const relationships = [
    ['one', 'user', TABLES.User, USER_FIELDS, 'userId'],
    ['one', 'business', TABLES.Business, BUSINESS_FIELDS, 'businessId']
];

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
    
}