import { gql } from 'apollo-server-express';
import { CODE, SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper, 
    updateHelper
} from '../query';
import { SkuModel as Model } from '../relationships';

export const typeDef = gql`
    enum SkuStatus {
        Deleted
        Inactive
        Active
    }

    input SkuInput {
        sku: String!
        isDiscountable: Boolean
        size: String
        note: String
        availability: Int
        price: String
        status: SkuStatus
        plantId: ID
        discountIds: [ID!]
    }

    type Sku {
        id: ID!
        sku: String!
        isDiscountable: Boolean!
        size: String!
        note: String
        availability: Int!
        price: String!
        status: SkuStatus!
        plant: Plant!
        discounts: [Discount!]!
    }

    extend type Query {
        skus(ids: [ID!]): [Sku!]!
    }

    extend type Mutation {
        addSku(input: SkuInput!): Sku!
        updateSku(id: ID!, input: SkuInput!): Sku!
        deleteSkus(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    SkuStatus: SKU_STATUS,
    Query: {
        skus: async (_, args, _c, info) => {
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updateSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, id: args.id, input: args.input });
        },
        deleteSkus: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}