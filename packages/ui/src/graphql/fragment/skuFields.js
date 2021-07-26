import { gql } from 'graphql-tag';
import { plantFields } from '.';
import { discountFields } from '.';

export const skuFields = gql`
    ${plantFields}
    ${discountFields}
    fragment skuFields on Sku {
        id
        sku
        isDiscountable
        size
        note
        availability
        price
        status
        plant {
            ...plantFields
        }
        discounts {
            ...discountFields
        }
    }
`