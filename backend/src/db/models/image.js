import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { IMAGE_SIZE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';

// Fields that can be exposed in a query
export const IMAGE_FIELDS = [
    'id',
    'extension',
    'alt',
    'hash',
    'width',
    'height'
];

export const typeDef = gql`
    enum ImageSize {
        XS
        S
        M
        ML
        L
    }

    type Image {
        id: ID!
        extension: String!
        alt: String
        hash: String!
        width: Int!
        height: Int!
        labels: [String!]!
    }

    extend type Query {
        image(id: ID!, size: ImageSize): Image
        images(label: String!, size: ImageSize): [Image!]!
    }

    extend type Mutation {
        addImage(
            base64: String!
            alt: String
            labels: [String!]!
        ): Response!
        deleteImagesById(
            ids: [ID!]!
        ): Response
        # Images with labels that are not in this request will be saved
        deleteImagesByLabel(
            labels: [String!]!
        ): Response
    }
`

export const resolvers = {
    ImageSize: IMAGE_SIZE
}