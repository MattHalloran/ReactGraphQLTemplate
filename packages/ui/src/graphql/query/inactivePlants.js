import { gql } from 'graphql-tag';
import { plantFields, skuFields } from 'graphql/fragment';

export const inactivePlantsQuery = gql`
    ${plantFields}
    ${skuFields}
    query InactivePlantsQuery(
        $sortBy: SkuSortBy
    ) {
        inactivePlants(
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