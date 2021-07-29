import { gql } from 'graphql-tag';

export const imageFields = gql`
    fragment imageFields on ImageData {
        src
        alt
        description
    }
`