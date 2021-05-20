import { CODE } from '@local/shared';
import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import pathExists from './pathExists';

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
        deleteAddress(
            id: ID!
        ): Response
    }
`

const hydrate = (object) => ({
    ...object,
    // business: {

    // },
    // orders: {
        
    // }
})

export const resolvers = {
    Query: {
        addresses: async (_, args, context, info) => {
            if (!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);
            
            const qb = args.ids ? 
                    db(TABLES.Address).select().whereIn('id', args.ids) :
                    db(TABLES.Address).select();

            if (pathExists(info.fieldNodes, [TABLES.Address, 'business'])) {
                qb.leftJoin(TABLES.Business, `${TABLES.Business}.id`, `${TABLES.Address}.businessId`).first();
            }
            if (pathExists(info.fieldNodes, [TABLES.Address, 'orders'])) {
                qb.leftJoin(TABLES.Order, `${TABLES.Order}.addressId`, `${TABLES.Address}.id`);
            }

            const results = await qb;
            return results.map(r => hydrate(r));
        }
    }
}