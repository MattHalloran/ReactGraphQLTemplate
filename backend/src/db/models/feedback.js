import { gql } from 'apollo-server-express';

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