import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import pathExists from './pathExists';
import { CODE } from '@local/shared';

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
            id: ID!
            text: String!
            userId: ID
        ): Feedback!
        deleteFeedback(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    
}