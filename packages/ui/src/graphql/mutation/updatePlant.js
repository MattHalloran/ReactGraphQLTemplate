import { gql } from 'graphql-tag';
import { discountFields, plantFields, skuFields } from 'graphql/fragment';

export const updatePlantMutation = gql`
    ${plantFields}
    ${skuFields}
    ${discountFields}
    mutation updatePlant(
        $input: PlantInput!
    ) {
    updatePlant(
        input: $input
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