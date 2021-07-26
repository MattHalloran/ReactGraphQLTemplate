import { gql } from 'graphql-tag';
import { imageFields } from 'graphql/fragment/imageFields';

export const imagesByNameQuery = gql`
    ${imageFields}
    query ImagesByName(
        $fileNames: [String!]!
        $size: ImageSize
    ) {
    imagesByName(
        fileNames: $fileNames
        size: $size
    ) {
        ...imageFields
    }
  }
`