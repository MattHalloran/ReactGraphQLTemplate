import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

export const typeDef = gql`
    input AddressInput {
        id: ID
        tag: String
        name: String
        country: String!
        administrativeArea: String!
        subAdministrativeArea: String
        locality: String!
        postalCode: String!
        throughfare: String!
        premise: String
        deliveryInstructions: String
        businessId: ID!
    }

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
        addresses: [Address!]!
    }

    extend type Mutation {
        addAddress(input: AddressInput!): Address!
        updateAddress(input: AddressInput!): Address!
        deleteAddresses(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Query: {
        addresses: async (_parent: undefined, _args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.address.findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addAddress: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin && (context.req.businessId !== args.input.businessId)) return new CustomError(CODE.Unauthorized);
            return await context.prisma.address.create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updateAddress: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin, or updating your own
            const curr = await context.prisma.address.findUnique({ where: { id: args.input.id } });
            if (!context.req.isAdmin && context.req.businessId !== curr.businessId) return new CustomError(CODE.Unauthorized);
            return await context.prisma.addres.update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteAddresses: async (_parent: undefined, args: any, context: any, _info: any) => {
            // Must be admin, or deleting your own
            const specified = await context.prisma.address.findMany({ where: { id: { in: args.ids } } });
            if (!specified) return new CustomError(CODE.ErrorUnknown);
            const business_ids = [...new Set(specified.map((s: any) => s.businessId))];
            if (!context.req.isAdmin && (business_ids.length > 1 || context.req.business_id !== business_ids[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma.address.deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}