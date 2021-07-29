import { gql } from 'graphql-tag';
import { customerContactFields, customerSessionFields } from 'graphql/fragment';

export const profileQuery = gql`
    ${customerContactFields}
    ${customerSessionFields}
    query {
        profile {
            ...customerContactFields
            ...customerSessionFields
        }
    }
`