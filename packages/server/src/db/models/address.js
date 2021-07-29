import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper, 
    updateHelper
} from '../query';
import { AddressModel as Model } from '../relationships';

export const typeDef = gql`
    input AddressInput {
        id: ID
        tag: String
        name: String
        country: String!
        administrativeArea: String!
        subAdministrativeArea: String
        locality: String!
        postalCode: String!
        throughfare: String!
        premise: String
        deliveryInstructions: String
        businessId: ID!
    }

    type Address {
        id: ID!
        tag: String
        name: String
        country: String!
        administrativeArea: String!
        subAdministrativeArea: String
        locality: String!
        postalCode: String!
        throughfare: String!
        premise: String
        business: Business!
        orders: [Order!]!
    }

    extend type Query {
        addresses(ids: [ID!]): [Address!]!
    }

    extend type Mutation {
        addAddress(input: AddressInput!): Address!
        updateAddress(input: AddressInput!): Address!
        deleteAddresses(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        addresses: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addAddress: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            if(!req.isAdmin && (req.token.businessId !== args.input.businessId)) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updateAddress: async (_, args, { req }, info) => {
            // Must be admin, or updating your own
            const curr = await db(Model.name).where('id', args.input.id).first();
            if (!req.isAdmin && req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, input: args.input });
        },
        deleteAddresses: async (_, args, { req }) => {
            // Must be admin, or deleting your own
            let business_ids = await db(Model.name).select('businessId').whereIn('id', args.ids);
            business_ids = [...new Set(business_ids)];
            if (!req.isAdmin && (business_ids.length > 1 || req.token.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}