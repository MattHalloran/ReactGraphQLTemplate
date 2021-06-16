import { gql } from 'graphql-tag';

export const updateImagesMutation = gql`
    mutation updateImages(
        $data: [ImageUpdate!]!
        $deleting: [String!]
    ) {
    updateImages(
        data: $data
        deleting: $deleting
    )
}
`