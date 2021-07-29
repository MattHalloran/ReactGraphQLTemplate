import { gql } from 'graphql-tag';
import { orderFields, orderItemFields } from 'graphql/fragment';

export const updateOrderMutation = gql`
    ${orderFields}
    ${orderItemFields}
    mutation updateOrder(
        $input: OrderInput!
    ) {
    login(
        input: $input
    ) {
        ...orderFields
        items {
            ...orderItemFields
        }
    }
}
`