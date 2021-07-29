import { gql } from 'graphql-tag';

export const customerSessionFields = gql`
    fragment customerSessionFields on Customer {
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