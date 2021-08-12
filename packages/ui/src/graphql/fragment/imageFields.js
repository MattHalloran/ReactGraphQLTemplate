import { gql } from 'graphql-tag';

export const imageFields = gql`
    fragment imageFields on Image {
        src
        alt
        description
    }
`