import { gql } from 'graphql-tag';
import { emailFields } from './emailFields';
import { phoneFields } from './phoneFields';

export const userContactFields = gql`
    ${emailFields}
    ${phoneFields}
    fragment userContactFields on User {
        id
        firstName
        lastName
        pronouns
        emails {
            ...emailFields
        }
        phones {
            ...phoneFields
        }
        business
    }
`