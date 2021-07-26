import { gql } from 'graphql-tag';

export const uploadAvailabilityMutation = gql`
    mutation uploadAvailability(
        $file: Upload!
    ) {
    updateImages(
        file: $file
    )
}
`