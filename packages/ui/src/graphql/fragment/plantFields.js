import { gql } from 'graphql-tag';
import { imageFields } from './imageFields';

export const plantFields = gql`
    ${imageFields}
    fragment plantFields on Plant {
        id
        traits {
            name
            value
        }
        images {
            image {
                ...imageFields
            }
        }
    }
`