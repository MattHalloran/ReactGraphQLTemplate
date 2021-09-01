import { gql } from 'graphql-tag';
import { orderFields } from './orderFields';
import { orderItemFields } from './orderItemFields';

export const customerSessionFields = gql`
    ${orderFields}
    ${orderItemFields}
    fragment customerSessionFields on Customer {
        id
        emailVerified
        accountApproved
        status
        theme
        roles {
            role {
                title
                description
            }
        }
    }
`