import { gql } from 'graphql-tag';
import { customerSessionFields } from 'graphql/fragment';

export const changeCustomerStatusMutation = gql`
    ${customerSessionFields}
    mutation changeCustomerStatus(
        $id: ID!
        $status: AccountStatus!
    ) {
    updateCustomer(
        id: $id
        status: $status
    ) {
        ...customerSessionFields
    }
}
`