import { gql } from 'graphql-tag';

export const orderFields = gql`
    fragment orderFields on Order {
        id
        status
        specialInstructions
        desiredDeliveryDate
        expectedDeliveryDate
        isDelivery
        address
    }
`