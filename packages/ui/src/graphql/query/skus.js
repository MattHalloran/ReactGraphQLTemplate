import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const skusQuery = gql`
    ${skuFields}
    ${plantFields}
    ${discountFields}
    query SkusQuery(
        $sortBy: SkuSortBy
    ) {
        skus(
            sortBy: $sortBy
        ) {
            ...skuFields
            discounts {
                discount {
                    ...discountFields
                }
            }
            plant {
                ...plantFields
            }
        }
    }
`