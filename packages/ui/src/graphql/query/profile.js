import { gql } from 'graphql-tag';
import { userContactFields, userSessionFields } from 'graphql/fragment';

export const profileQuery = gql`
    ${userContactFields}
    ${userSessionFields}
    query {
        profile {
            ...userContactFields
            ...userSessionFields
        }
    }
`