import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const skusQuery = gql`
    ${skuFields}
    ${plantFields}
    ${discountFields}
    query SkusQuery(
        $sortBy: SkuSortBy!
        $showUnavailable: Boolean
    ) {
        skus(
            sortBy: $sortBy
        ) {
            ...skuFields
            discounts {
                ...discountFields
            }
            plant {
                ...plantFields
            }
        }
    }
`