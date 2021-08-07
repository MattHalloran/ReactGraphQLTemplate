import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const activePlantsQuery = gql`
    ${plantFields}
    ${skuFields}
    ${discountFields}
    query ActivePlantsQuery(
        $sortBy: SkuSortBy!
    ) {
        activePlants(
            sortBy: $sortBy
        ) {
            ...plantFields
            skus {
                ...skuFields
                discounts {
                    ...discountFields
                }
            }
        }
    }
`