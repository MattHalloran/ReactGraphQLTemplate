import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';
import { BusinessModel as Model } from '../relationships';

export const typeDef = gql`
    type Business {
        id: ID!
        name: String!
        subscribedToNewsletters: Boolean!
        addresses: [Address!]!
        phones: [Phone!]!
        emails: [Email!]!
        employees: [User!]!
        discounts: [Discount!]!
    }

    extend type Query {
        businesses(ids: [ID!]): [Business!]!
    }

    extend type Mutation {
        addBusiness(
            name: String!
            subscribedToNewsletters: Boolean
        ): Business!
        updateBusiness(
            name: String
            subscribedToNewsletters: Boolean
        ): Business!
        deleteBusinesses(
            ids: [ID!]!
        ): Response
        setBusinessDiscounts(
            ids: [ID!]!
        ): Response
        setBusinessEmployees(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, args, {req, res}, info) => {
            // Only admins can query addresses
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addBusiness: async(_, args, {req, res}) => {
            // Only admins can directly add businesses
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).returning('*').insert({
                name: args.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? false
            })

            return added;
        },
        updateBusiness: async(_, args, {req, res}) => {
            // Only admins can update other businesses
            if(!req.isAdmin || (req.token.businessId !== args.id)) return new CustomError(CODE.Unauthorized);

            const curr = await db(Model.name).where('id', args.id).first();
            const updated = await db(Model.name).where('id', args.id).update({
                name: args.name ?? curr.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? curr.subscribedToNewsletters
            }).returning('*');

            return updated;
        },
        deleteBusinesses: async(_, args, {req, res}) => {
            // Only admins can delete other businesses
            if(!req.isAdmin || args.ids.length > 1 || req.token.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 

            const numDeleted = await db(Model.name).delete().whereIn('id', args.ids);

            return new CustomError(numDeleted > 0 ? CODE.Success : CODE.ErrorUnknown);
        },
        setBusinessDiscounts: async(_, args, {req, res}) => {
            // TODO
            return new CustomError(CODE.NotImplemented);
        },
        setBusinessEmployees: async(_, args, {req, res}) => {
            // TODO
            return new CustomError(CODE.NotImplemented);
        }
    }
}