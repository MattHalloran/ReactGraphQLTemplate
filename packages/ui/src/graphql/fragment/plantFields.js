import { gql } from 'graphql-tag';
import { imageFields } from '.';

export const plantFields = gql`
    ${imageFields}
    fragment plantFields on Plant {
        id
        traits {
            name
            value
        }
        images {
            ...imageFields
        }
    }
`