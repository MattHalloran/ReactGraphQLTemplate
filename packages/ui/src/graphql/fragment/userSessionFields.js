import { gql } from 'graphql-tag';

export const userSessionFields = gql`
    fragment userSessionFields on User {
        id
        emailVerified
        accountApproved
        status
        theme
        roles {
            title
        }
    }
`