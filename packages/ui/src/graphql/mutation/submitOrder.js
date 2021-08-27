import { gql } from 'graphql-tag';
import { orderFields, orderItemFields } from 'graphql/fragment';

export const submitOrderMutation = gql`
    ${orderFields}
    ${orderItemFields}
    mutation submitOrder(
        $id: ID!
    ) {
    submitOrder(
        id: $id
    ) {
        ...orderFields
        items {
            ...orderItemFields
        }
    }
}
`