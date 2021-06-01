import { gql } from 'graphql-tag';

export const customersQuery = gql`
    query {
        users {
            id
            firstName
            lastName
            business {
                name
            }
            pronouns
            status
            emails {
                emailAddress
            }
            phones {
                number
                countryCode
                extension
            }
        }
    }
`