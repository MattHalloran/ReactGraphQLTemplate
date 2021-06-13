import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper, updateHelper } from '../query';
import { AddressModel as Model } from '../relationships';

export const typeDef = gql`
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
        addAddress(
            tag: String
            name: String
            country: String!
            administrativeArea: String!
            subAdministrativeArea: String
            locality: String!
            postalCode: String!
            throughfare: String!
            premise: String
            businessId: ID!
        ): Address!
        updateAddress(
            id: ID!
            tag: String
            name: String
            country: String
            administrativeArea: String
            subAdministrativeArea: String
            locality: String
            postalCode: String
            throughfare: String
            premise: String
        ): Response
        deleteAddresses(
            ids: [ID!]!
        ): Boolean
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
            if(!req.isAdmin && (req.token.businessId !== args.businessId)) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).insertAndFetch({
                tag: args.tag,
                name: args.name,
                country: args.country,
                administrativeArea: args.administrativeArea,
                subAdministrativeArea: args.subAdministrativeArea,
                locality: args.locality,
                postalCode: args.postalCode,
                throughfare: args.throughfare,
                premise: args.premise,
                businessId: args.businessId
            });
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateAddress: async (_, args, { req }, info) => {
            // Must be admin, or updating your own
            const curr = await db(Model.name).where('id', args.id).first();
            if (!req.isAdmin && req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);

            await updateHelper(Model, args, curr);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
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