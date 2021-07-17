import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    fullSelectQueryHelper, 
    updateHelper
} from '../query';
import { BusinessModel as Model } from '../relationships';

export const typeDef = gql`
    input BusinessInput {
        name: String!
        subscribedToNewsletters: Boolean
        discountIds: [ID!]
        employeeIds: [ID!]
    }

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
        addBusiness(input: BusinessInput!): Business!
        updateBusiness(id: ID!, input: BusinessInput!): Business!
        deleteBusinesses(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    Query: {
        businesses: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        }
    },
    Mutation: {
        addBusiness: async(_, args, { req }, info) => {
            // Must be admin
            if(!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updateBusiness: async(_, args, { req }, info) => {
            // Must be admin, or updating your own
            if(!req.isAdmin || (req.token.businessId !== args.id)) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, id: args.id, input: args.input });
        },
        deleteBusinesses: async(_, args, { req }) => {
            // Must be admin, or deleting your own
            if(!req.isAdmin || args.ids.length > 1 || req.token.businessId !== args.ids[0]) return new CustomError(CODE.Unauthorized); 
            return await deleteHelper(Model.name, args.ids);
        },
    }
}