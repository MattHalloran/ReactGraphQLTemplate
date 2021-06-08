import { gql } from 'graphql-tag';

export const addImageMutation = gql`
    mutation addImage(
        $files: [Upload!]!
        $alts: [String]
        $labels: [String!]!
    ) {
    addImage(
        files: $files
        alts: $alts
        labels: $labels
    ) {
        successfulFileNames
        failedFileNames
    }
}
`