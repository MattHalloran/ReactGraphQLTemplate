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
        ): Response
    }
`

export const resolvers = {
    Query: {
        addresses: async (_, args, { req }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addAddress: async (_, args, { req }, info) => {
            // Only admins can add for other businesses
            if(!req.isAdmin || (req.token.businessId !== args.businessId)) return new CustomError(CODE.Unauthorized);

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
            // Only admins can update for other businesses
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await db(Model.name).where('id', args.id).first();
            if (req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);

            const updated = await updateHelper(Model, args, curr);
            return (await fullSelectQueryHelper(Model, info, [updated.id]))[0];
        },
        deleteAddresses: async (_, args, { req }) => {
            // Only admins can delete for other businesses
            if(!req.isAdmin || args.ids.length > 1) return new CustomError(CODE.Unauthorized);
            const curr = await db(Model.name).where('id', args.ids[0]).first();
            if (req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);   
            return await deleteHelper(Model.name, args.ids);
        }
    }
}