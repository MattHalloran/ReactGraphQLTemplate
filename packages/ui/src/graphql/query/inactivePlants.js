import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const inactivePlantsQuery = gql`
    ${plantFields}
    ${skuFields}
    ${discountFields}
    query InactivePlantsQuery(
        $sortBy: PlantSortBy!
    ) {
        inactivePlants(
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