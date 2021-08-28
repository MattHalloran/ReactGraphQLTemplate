import { gql } from 'graphql-tag';
import { skuFields } from './skuFields';
import { plantFields } from './plantFields';
import { discountFields } from './discountFields';

export const orderItemFields = gql`
    ${skuFields}
    ${plantFields}
    ${discountFields}
    fragment orderItemFields on OrderItem {
        id
        quantity
        sku {
            ...skuFields
            plant {
                ...plantFields
            }
            discounts {
                discount {
                    ...discountFields
                }
            }
        }
    }
`