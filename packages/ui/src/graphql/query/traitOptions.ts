import { gql } from 'graphql-tag';

export const traitOptionsQuery = gql`
    query traitOptions {
        traitOptions {
            name
            values
        }
    }
`