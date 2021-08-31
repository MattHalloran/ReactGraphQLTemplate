import { gql } from 'graphql-tag';
import { plantFields, skuFields } from 'graphql/fragment';

export const updatePlantMutation = gql`
    ${plantFields}
    ${skuFields}
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