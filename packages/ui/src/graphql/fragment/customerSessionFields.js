import { gql } from 'graphql-tag';

export const customerSessionFields = gql`
    fragment customerSessionFields on Customer {
        id
        emailVerified
        accountApproved
        status
        theme
        roles {
            role {
                title
                description
            }
        }
        orders {
            id
            items {
                id
                quantity
                sku {
                    sku
                }
            }
        }
    }
`