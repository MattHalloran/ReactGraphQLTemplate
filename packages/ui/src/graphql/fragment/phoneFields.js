import { gql } from 'graphql-tag';

export const phoneFields = gql`
    fragment phoneFields on Phone {
        number
        countryCode
        extension
        receivesDeliveryUpdates
    }
`