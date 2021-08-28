import { gql } from 'graphql-tag';
import { orderItemFields } from 'graphql/fragment';

export const addOrderItemMutation = gql`
    ${orderItemFields}
    mutation addOrderItem(
        $quantity: Int!
        $orderId: ID
        $skuId: ID!
    ) {
    addOrderItem(
        quantity: $quantity
        orderId: $orderId
        skuId: $skuId
    ) {
        ...orderItemFields
    }
}
`