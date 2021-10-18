import { gql } from 'graphql-tag';
import { customerContactFields, orderFields, orderItemFields } from 'graphql/fragment';

export const customersQuery = gql`
    ${customerContactFields}
    ${orderFields}
    ${orderItemFields}
    query customers {
        customers {
            ...customerContactFields
            status
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