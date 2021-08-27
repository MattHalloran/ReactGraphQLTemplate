import { gql } from 'graphql-tag';
import { plantFields, skuFields } from 'graphql/fragment';

export const plantsQuery = gql`
    ${plantFields}
    ${skuFields}
    query ActivePlantsQuery(
        $ids: [ID!]
        $sortBy: SkuSortBy
        $searchString: String
        $active: Boolean
    ) {
        plants(
            ids: $ids
            sortBy: $sortBy
            searchString: $searchString
            active: $active
        ) {
            ...plantFields
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