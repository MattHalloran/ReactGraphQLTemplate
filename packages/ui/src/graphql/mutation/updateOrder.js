import { gql } from 'graphql-tag';
import { orderFields, orderItemFields } from 'graphql/fragment';

export const updateOrderMutation = gql`
    ${orderFields}
    ${orderItemFields}
    mutation updateOrder(
        $id: String!
        $status: String
        $specialInstructions: String
        $desiredDeliveryDate: Date
        $isDelivery: Boolean
        $items: [OrderItemInput!]
    ) {
    login(
        id: $id
        status: $status
        specialInstructions: $specialInstructions
        desiredDeliveryDate: $desiredDeliveryDate
        isDelivery: $isDelivery
        items: $items
    ) {
        ...orderFields
        items {
            ...orderItemFields
        }
    }
}
`