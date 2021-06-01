import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';
import { ADDRESS_RELATIONSHIPS } from '../relationships';

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
        addresses: async (_, args, context, info) => {
            // Only admins can query addresses
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQuery(info, args.ids, TABLES.Address, ADDRESS_RELATIONSHIPS);
        }
    },
    Mutation: {
        addAddress: async (_, args, context) => {
            // Only admins can add addresses for other businesses
            if(!context.req.isAdmin || (context.token.businessId !== args.businessId)) return context.res.sendStatus(CODE.Unauthorized);

            const added = await db(TABLES.Address).insertAndFetch({
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
            })

            return added;
        },
        updateAddress: async (_, args, context) => {
            // Only admins can update addresses for other businesses
            if(!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);
            const curr = await db(TABLES.Address).where('id', args.id).first();
            if (context.token.businessId !== curr.businessId) return context.res.sendStatus(CODE.Unauthorized);

            const updated = await db(TABLES.Address).where('id', args.id).update({
                tag: args.tag ?? curr.tag,
                name: args.name ?? curr.name,
                country: args.country ?? curr.country,
                administrativeArea: args.administrativeArea ?? curr.administrativeArea,
                subAdministrativeArea: args.subAdministrativeArea ?? curr.subAdministrativeArea,
                locality: args.locality ?? curr.locality,
                postalCode: args.postalCode ?? curr.postalCode,
                throughfare: args.throughfare ?? curr.throughfare,
                premise: args.premise ?? curr.premise
            }).returning('*');

            return updated;
        },
        deleteAddresses: async (_, args, context) => {
            // Only admins can delete addresses for other businesses
            if(!context.req.isAdmin || args.ids.length > 1) return context.res.sendStatus(CODE.Unauthorized);
            const curr = await db(TABLES.Address).where('id', args.ids[0]).first();
            if (context.token.businessId !== curr.businessId) return context.res.sendStatus(CODE.Unauthorized);   

            const numDeleted = await db(TABLES.Address).delete().whereIn('id', args.ids);

            return context.res.sendStatus(numDeleted > 0 ? CODE.Success : CODE.ErrorUnknown);
        }
    }
}