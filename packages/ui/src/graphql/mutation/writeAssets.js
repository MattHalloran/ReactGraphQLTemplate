import { gql } from 'graphql-tag';

export const writeAssetsMutation = gql`
    mutation writeAssets(
        $files: [String!]!
    ) {
        writeAssets(
            files: $files
        ) {
            success
        }
    }
`