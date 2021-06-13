import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, updateHelper } from '../query';
import { PhoneModel as Model } from '../relationships';

export const typeDef = gql`
    type Phone {
        id: ID!
        number: String!
        countryCode: String!
        extension: String
        receivesDeliveryUpdates: Boolean!
        user: User
        business: Business
    }

    extend type Query {
        phones(ids: [ID!]): [Phone!]!
    }

    extend type Mutation {
        addPhone(
            number: String!
            countryCode: String!
            extension: String
            receivesDeliveryUpdates: Boolean, 
            userId: ID, 
            businessID: ID
        ): Phone!
        updatePhone(
            id: ID!
            number: String
            countryCode: String
            extension: String
            receivesDeliveryUpdates: Boolean, 
            userId: ID, 
            businessID: ID
        ): Response
        deletePhones(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        phones: async (_, args, { req, res }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addPhone: async (_, args, { req }, info) => {
            // Only admins can add for other businesses
            if(!req.isAdmin || (req.token.businessId !== args.businessId)) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).insertAndFetch({
                number: args.number,
                countryCode: args.countryCode,
                extension: args.extension,
                receivesDeliveryUpdates: args.receivesDeliveryUpdates,
                userId: args.userId,
                businessId: args.businessId
            })
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updatePhone: async (_, args, { req }, info) => {
            // Only admins can update for other businesses
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await db(Model.name).where('id', args.id).first();
            if (req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);

            const updated = await updateHelper(Model, args, curr);
            return (await fullSelectQueryHelper(Model, info, [updated.id]))[0];
        },
        deletePhones: async (_, args, { req }) => {
            // Only admins can delete for other businesses
            if(!req.isAdmin || args.ids.length > 1) return new CustomError(CODE.Unauthorized);
            const curr = await db(Model.name).where('id', args.ids[0]).first();
            if (req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);   
            return await deleteHelper(Model.name, args.ids);
        },
    }
}