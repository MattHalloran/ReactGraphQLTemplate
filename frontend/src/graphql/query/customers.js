import { gql } from 'graphql-tag';

export const customersQuery = gql`
    query {
        users {
            fileName
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