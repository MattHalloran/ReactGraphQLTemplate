import { gql } from 'graphql-tag';
import { plantFields } from './plantFields';
import { discountFields } from './discountFields';

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