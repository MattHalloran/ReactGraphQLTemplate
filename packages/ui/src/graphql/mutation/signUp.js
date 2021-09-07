import { gql } from 'graphql-tag';
import { customerSessionFields, orderFields, orderItemFields } from 'graphql/fragment';

export const signUpMutation = gql`
    ${customerSessionFields}
    ${orderFields}
    ${orderItemFields}
    mutation signUp(
        $firstName: String!
        $lastName: String!
        $pronouns: String
        $business: String!
        $email: String!
        $phone: String!
        $accountApproved: Boolean!
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
        accountApproved: $accountApproved
        marketingEmails: $marketingEmails
        password: $password
    ) {
        ...customerSessionFields
        cart {
            ...orderFields
            items {
                ...orderItemFields
            }
        }
    }
}
`