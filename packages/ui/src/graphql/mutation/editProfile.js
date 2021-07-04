import { gql } from 'graphql-tag';

export const editProfileMutation = gql`
    mutation editProfile(
        $firstName: String!
        $lastName: String!
        $pronouns: String
        $businessName: String!
        $email: String!
        $phone: String!
        $theme: String!
        $existingCustomer: Boolean!
        $marketingEmails: Boolean!
        $currentPassword: String!
        $newPassword: String
    ) {
    signUp(
        firstName: $firstName
        lastName: $lastName
        pronouns: $pronouns
        businessName: $businessName
        email: $email
        phone: $phone
        theme: $theme
        existingCustomer: $existingCustomer
        marketingEmails: $marketingEmails
        currentPassword: $currentPassword
        newPassword: $newPassword
    ) {
        id
        theme
        roles {
            title
        }
    }
}
`