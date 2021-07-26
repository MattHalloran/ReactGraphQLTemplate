import { gql } from 'graphql-tag';
import { orderFields, orderItemFields, userContactFields } from 'graphql/fragment';

export const ordersQuery = gql`
    ${orderFields}
    ${orderItemFields}
    ${userContactFields}
    query Orders(
        $ids: [ID!]
        $userIds: [ID!]
        status: OrderStatus
    ) {
        orders(
            ids: $ids
            userIds: $userIds
            status: $status
        ) {
            ...orderFields
            items {
                ...orderItemFields
            }
            user {
                ...userContactFields
            }
        }
    }
`