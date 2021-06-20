import { gql } from 'graphql-tag';

export const imagesByNameQuery = gql`
    query ImagesByName(
        $fileNames: [String!]!
        $size: ImageSize
    ) {
    imagesByName(
        fileNames: $fileNames
        size: $size
    )
  }
`