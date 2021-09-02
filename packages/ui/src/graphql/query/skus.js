import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const skusQuery = gql`
    ${skuFields}
    ${plantFields}
    ${discountFields}
    query SkusQuery(
        $ids: [ID!]
        $sortBy: SkuSortBy
        $searchString: String
        $onlyInStock: Boolean
    ) {
        skus(
            ids: $ids
            sortBy: $sortBy
            searchString: $searchString
            onlyInStock: $onlyInStock
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