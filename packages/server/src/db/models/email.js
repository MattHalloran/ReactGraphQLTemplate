import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, updateHelper } from '../query';
import { EmailModel as Model } from '../relationships';

export const typeDef = gql`
    type Email {
        id: ID!
        emailAddress: String!
        receivesDeliveryUpdates: Boolean!
        user: User
        business: Business
    }

    extend type Query {
        emails(ids: [ID!]): [Email!]!
    }

    extend type Mutation {
        addEmail(
            emailAddress: String!
            receivesDeliveryUpdates: Boolean
            userId: ID
            businessId: ID
        ): Email!
        updateEmail(
            receivesDeliveryUpdates: Boolean!
        ): Response
        deleteEmails(
            ids: [ID!]!
        ): Boolean
    }
`

export const resolvers = {
    Query: {
        emails: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addEmail: async (_, args, { req }, info) => {
            // Must be admin, or adding to your own
            if(!req.isAdmin || (req.token.businessId !== args.businessId)) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).insertAndFetch({
                emailAddress: args.emailAddress,
                receivesDeliveryUpdates: args.receivesDeliveryUpdates,
                userId: args.userId,
                businessId: args.businessId
            });
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateEmail: async (_, args, { req }, info) => {
            // Must be admin, or updating your own
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await db(Model.name).where('id', args.id).first();
            if (req.token.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);

            await updateHelper(Model, args, curr);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteEmails: async (_, args, { req, res }) => {
            // Must be admin, or deleting your own
            // TODO must keep at least one email per user
            let business_ids = await db(Model.name).select('businessId').whereIn('id', args.ids);
            business_ids = [...new Set(business_ids)];
            if (!req.isAdmin && (business_ids.length > 1 || req.token.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);

            return await deleteHelper(Model.name, args.ids);
        }
    }
}