import { gql } from 'graphql-tag';

export const deletePlantsMutation = gql`
    mutation deletePlants(
        $ids: [ID!]!
    ) {
    deletePlants(
        ids: $ids
    ) {
        count
    }
}
`