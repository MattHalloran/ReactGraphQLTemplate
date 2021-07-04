import { gql } from 'apollo-server-express';
import { db } from '../db';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { deleteHelper, fullSelectQueryHelper, insertJoinRowsHelper, updateChildRelationshipsHelper, updateHelper, updateJoinRowsHelper } from '../query';
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
        ): Boolean
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addBusiness: async(_, args, { req }, info) => {
            // Must be admin
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            const added = await db(Model.name).returning('*').insert({
                name: args.name,
                subscribedToNewsletters: args.subscribedToNewsletters ?? false
            });
            await insertJoinRowsHelper(Model, 'discounts', added.id, args.discountIds);
            await addChildRelationshipsHelper(Model, 'employees', added.id, args.employeeIds);
            return (await fullSelectQueryHelper(Model, info, [added.id]))[0];
        },
        updateBusiness: async(_, args, { req }, info) => {
            // Must be admin, or updating your own
            if(!req.isAdmin || (req.token.businessId !== args.id)) return new CustomError(CODE.Unauthorized);
            await updateHelper(Model, args, curr);
            await updateJoinRowsHelper(Model, 'discounts', args.id, args.discountIds);
            await updateChildRelationshipsHelper(Model, 'employees', args.id, args.employeeIds);
            return (await fullSelectQueryHelper(Model, info, [args.id]))[0];
        },
        deleteBusinesses: async(_, args, { req }) => {
            // Must be admin, or deleting your own
            if(!req.isAdmin || args.ids.length > 1 || req.token.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 
            return await deleteHelper(Model.name, args.ids);
        },
    }
}