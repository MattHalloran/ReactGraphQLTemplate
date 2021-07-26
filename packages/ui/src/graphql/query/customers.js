import { gql } from 'graphql-tag';
import { userContactFields } from 'graphql/fragment';

export const customersQuery = gql`
    ${userContactFields}
    query {
        users {
            ...userContactFields
            status
        }
    }
`