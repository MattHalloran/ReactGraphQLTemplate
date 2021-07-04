import { gql } from 'graphql-tag';

export const profileQuery = gql`
    query {
        profile {
            firstName
            lastName
            pronouns
            emails {
                emailAddress
                receivesDeliveryUpdates
            }
            phones {
                number
                countryCode
                extension
                receivesDeliveryUpdates
            }
            business {
                name
            }
            theme
            accountApproved
            emailVerified
            status
        }
    }
`