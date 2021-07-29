import { gql } from 'graphql-tag';
import { orderFields, orderItemFields, customerContactFields } from 'graphql/fragment';

export const ordersQuery = gql`
    ${orderFields}
    ${orderItemFields}
    ${customerContactFields}
    query Orders(
        $ids: [ID!]
        $customerIds: [ID!]
        $status: OrderStatus
    ) {
        orders(
            ids: $ids
            customerIds: $customerIds
            status: $status
        ) {
            ...orderFields
            items {
                ...orderItemFields
            }
            customer {
                ...customerContactFields
            }
        }
    }
`