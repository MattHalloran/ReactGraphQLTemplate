import { gql } from 'apollo-server-express';
import { CODE, SKU_SORT_OPTIONS, SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { saveFile } from '../utils';
import { uploadAvailability } from '../worker/uploadAvailability/queue';
import { db, TABLES } from '../db';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Sku;

export const typeDef = gql`
    enum SkuStatus {
        Deleted
        Inactive
        Active
    }

    enum SkuSortBy {
        AZ
        ZA
        PriceLowHigh
        PriceHighLow
        Featured
        Newest
        Oldest
    }

    input SkuInput {
        id: ID
        sku: String!
        isDiscountable: Boolean
        size: String
        note: String
        availability: Int
        price: String
        status: SkuStatus
        plantId: ID
        discountIds: [ID!]
    }

    type SkuDiscount {
        discount: Discount!
    }

    type Sku {
        id: ID!
        sku: String!
        isDiscountable: Boolean!
        size: String
        note: String
        availability: Int!
        price: String
        status: SkuStatus!
        plant: Plant!
        discounts: [SkuDiscount!]
    }

    extend type Query {
        skus(ids: [ID!], sortBy: SkuSortBy, searchString: String, onlyInStock: Boolean): [Sku!]!
    }

    extend type Mutation {
        uploadAvailability(file: Upload!): Boolean
        addSku(input: SkuInput!): Sku!
        updateSku(input: SkuInput!): Sku!
        deleteSkus(ids: [ID!]!): Count!
    }
`

const SORT_TO_QUERY = {
    [SKU_SORT_OPTIONS.AZ]: { plant: { latinName: 'asc' } },
    [SKU_SORT_OPTIONS.ZA]: { plant: { latinName: 'desc' } },
    [SKU_SORT_OPTIONS.PriceLowHigh]: { price: 'asc' },
    [SKU_SORT_OPTIONS.PriceHighLow]: { price: 'desc' },
    [SKU_SORT_OPTIONS.Newest]: { created_at: 'desc' },
    [SKU_SORT_OPTIONS.Oldest]: { created_at: 'asc' },
}

export const resolvers = {
    SkuStatus: SKU_STATUS,
    SkuSortBy: SKU_SORT_OPTIONS,
    Query: {
        // Query all SKUs
        skus: async (_, args, context, info) => {
            let idQuery;
            if (Array.isArray(args.ids)) idQuery = { id: { in: args.ids } };
            // Determine sort order
            let sortQuery;
            if (args.sortBy !== undefined) sortQuery = SORT_TO_QUERY[args.sortBy];
            console.log("SORT BY", args.sortBy);
            let searchQuery;
            if (args.searchString !== undefined && args.searchString.length > 0) {
                searchQuery = {
                    OR: [
                        { plant: { latinName: { contains: args.searchString.trim(), mode: 'insensitive' } } },
                        { plant: { traits: { some: { value: { contains: args.searchString.trim(), mode: 'insensitive' } } } } }
                    ]
                }
            }
            let onlyInStockQuery;
            if (!args.onlyInStock) onlyInStockQuery = { availability: { gt: 0 } };
            return await context.prisma[_model].findMany({
                where: {
                    ...idQuery,
                    ...searchQuery,
                    ...showOutOfStockQuery
                },
                orderBy: sortQuery,
                ...(new PrismaSelect(info).value)
            });
        }
    },
    Mutation: {
        uploadAvailability: async (_, args) => {
            const { createReadStream, mimetype } = await args.file;
            const stream = createReadStream();
            const filename = `private/availability-${Date.now()}.xls`;
            const { success, filename: finalFileName } = await saveFile(stream, filename, mimetype, false, ['.csv', '.xls', '.xlsx', 'text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/comma-separated-values', 'text/x-comma-separated-values']);
            if (success) uploadAvailability(finalFileName);
            return success;
        },
        addSku: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updateSku: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteSkus: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}