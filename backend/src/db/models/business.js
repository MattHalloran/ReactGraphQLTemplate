import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, insertJoinRowsHelper, updateHelper } from '../query';
import { BusinessModel as Model } from '../relationships';
import { TABLES } from '../tables';

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
            discountIds: [ID!]
            employeeIds: [ID!]
        ): Business!
        updateBusiness(
            name: String
            subscribedToNewsletters: Boolean
            discountIds: [ID!]
            employeeIds: [ID!]
        ): Business!
        deleteBusinesses(
            ids: [ID!]!
        ): Response
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, args, { req, res }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addBusiness: async(_, args, { req }, info) => {
            // Only admins can add
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);

            const added = await db(Model.name).returning('*').insert({
                name: args.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? false
            });
            await insertJoinRowsHelper(Model, 'discounts', added.id, args.discountIds);
            // TODO employeeIds is a many relationship, so join rows helper will not work
            if (args.employeeIds?.length > 0) {
                return new CustomError(CODE.NotImplemented);
            }
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateBusiness: async(_, args, { req }, info) => {
            // Only admins can update
            if(!req.isAdmin || (req.token.businessId !== args.id)) return new CustomError(CODE.Unauthorized);

            const updated = await updateHelper(Model, args, curr);
            if (args.discountIds) {
                const existing_discounts = await db(TABLES.BusinessDiscounts)
                    .select('businessId')
                    .where('businessId', args.id);
                // Add the new associations
                // Remove the old associations
                return new CustomError(CODE.NotImplemented);
            }
            if (args.employeeIds?.length > 0) {
                return new CustomError(CODE.NotImplemented);
            }
            return (await fullSelectQueryHelper(Model, info, [updated.id]))[0];
        },
        deleteBusinesses: async(_, args, { req }) => {
            // Only admins can delete
            if(!req.isAdmin || args.ids.length > 1 || req.token.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 
            return await deleteHelper(Model.name, args.ids);
        },
    }
}