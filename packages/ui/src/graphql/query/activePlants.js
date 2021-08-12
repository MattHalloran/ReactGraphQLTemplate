import { gql } from 'graphql-tag';
import { plantFields, skuFields } from 'graphql/fragment';

export const activePlantsQuery = gql`
    ${plantFields}
    ${skuFields}
    query ActivePlantsQuery(
        $sortBy: SkuSortBy
    ) {
        activePlants(
            sortBy: $sortBy
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