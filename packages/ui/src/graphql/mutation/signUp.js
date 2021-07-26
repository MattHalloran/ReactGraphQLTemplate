import { gql } from 'graphql-tag';
import { userSessionFields } from 'graphql/fragment';

export const signUpMutation = gql`
    ${userSessionFields}
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
        ...userSessionFields
    }
}
`