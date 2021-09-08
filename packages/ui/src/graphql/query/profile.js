import { gql } from 'graphql-tag';

export const profileQuery = gql`
    query {
        profile {
            id
            firstName
            lastName
            pronouns
            theme
            accountApproved
            business {
                id
                name
            }
            emails {
                id
                emailAddress
                receivesDeliveryUpdates
            }
            phones {
                id
                number
                receivesDeliveryUpdates
            }
        }
    }
`