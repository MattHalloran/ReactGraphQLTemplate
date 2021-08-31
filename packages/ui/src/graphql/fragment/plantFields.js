import { gql } from 'graphql-tag';
import { imageFields } from './imageFields';

export const plantFields = gql`
    ${imageFields}
    fragment plantFields on Plant {
        id
        latinName
        traits {
            name
            value
        }
        images {
            index
            isDisplay
            image {
                ...imageFields
            }
        }
    }
`