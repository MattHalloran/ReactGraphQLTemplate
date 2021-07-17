import { gql } from 'graphql-tag';

export const signUpMutation = gql`
    mutation signUp(
        $firstName: String!
        $lastName: String!
        $pronouns: String
        $business: String!
        $email: String!
        $phone: String!
        $existingCustomer: Boolean!
        $marketingEmails: Boolean!
        $password: String!
    ) {
    signUp(
        firstName: $firstName
        lastName: $lastName
        pronouns: $pronouns
        business: $business
        email: $email
        phone: $phone
        existingCustomer: $existingCustomer
        marketingEmails: $marketingEmails
        password: $password
    ) {
        id
        theme
        roles {
            title
        }
    }
}
`