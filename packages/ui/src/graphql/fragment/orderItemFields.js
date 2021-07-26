import { gql } from 'graphql-tag';
import { skuFields } from '.';

export const orderItemFields = gql`
    ${skuFields}
    fragment orderItemFields on OrderItem {
        id
        quantity
        sku {
            ...skuFields
        }
    }
`