import { gql } from 'graphql-tag';

export const imagesByLabelQuery = gql`
    query ImagesByLabel(
        $label: String!
        $size: ImageSize
    ) {
    imagesByLabel(
        label: $label
        size: $size
    )
  }
`