import { gql } from 'graphql-tag';
import { customerContactFields, orderFields, orderItemFields } from 'graphql/fragment';

export const addCustomerMutation = gql`
    ${customerContactFields}
    ${orderFields}
    ${orderItemFields}
    mutation addCustomer(
        $input: CustomerInput!
    ) {
    addCustomer(
        input: $input
    ) {
        ...customerContactFields
        status
        accountApproved
        orders {
            ...orderFields
            items {
                ...orderItemFields
            }
        }
        roles {
            role {
                title
            }
        }
    }
}
`