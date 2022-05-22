import { gql } from 'graphql-tag';

export const profileQuery = gql`
    query profile {
        profile {
            id
            firstName
            lastName
            notifications
            pronouns
            theme
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