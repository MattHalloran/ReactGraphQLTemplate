import { gql } from 'graphql-tag';
import { productFields, skuFields } from 'graphql/fragment';

export const productsQuery = gql`
    ${productFields}
    ${skuFields}
    query ActiveProductssQuery(
        $ids: [ID!]
        $sortBy: SkuSortBy
        $searchString: String
        $active: Boolean
    ) {
        products(
            ids: $ids
            sortBy: $sortBy
            searchString: $searchString
            active: $active
        ) {
            ...productFields
            skus {
                ...skuFields
                discounts {
                    discount {
                        id
                        discount
                        title
                        comment
                        terms
                    }
                }
            }
        }
    }
`