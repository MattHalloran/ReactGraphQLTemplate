import { gql } from 'apollo-server-express';
import { CODE, SKU_SORT_OPTIONS } from '@local/shared';
import { CustomError } from '../error';
import { saveFile } from '../utils';
import { uploadAvailability } from '../worker/uploadAvailability/queue';
import { PrismaSelect } from '@paljs/plugins';
import path from 'path';
import pkg from '@prisma/client';
const { SkuStatus } = pkg;

export const typeDef = gql`
    enum SkuStatus {
        DELETED
        INACTIVE
        ACTIVE
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
        productId: ID
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
        product: Product!
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

const SORT_TO_QUERY: {[key: string]: {}} = {
    [SKU_SORT_OPTIONS.AZ]: { product: { name: 'asc' } },
    [SKU_SORT_OPTIONS.ZA]: { product: { name: 'desc' } },
    [SKU_SORT_OPTIONS.PriceLowHigh]: { price: 'asc' },
    [SKU_SORT_OPTIONS.PriceHighLow]: { price: 'desc' },
    [SKU_SORT_OPTIONS.Newest]: { created_at: 'desc' },
    [SKU_SORT_OPTIONS.Oldest]: { created_at: 'asc' },
}

export const resolvers = {
    SkuStatus: SkuStatus,
    SkuSortBy: SKU_SORT_OPTIONS,
    Query: {
        // Query all SKUs
        skus: async (_parent: undefined, args: any, context: any, info: any) => {
            let idQuery;
            if (Array.isArray(args.ids)) idQuery = { id: { in: args.ids } };
            // Determine sort order
            let sortQuery;
            if (args.sortBy !== undefined) sortQuery = SORT_TO_QUERY[args.sortBy];
            let searchQuery;
            if (args.searchString !== undefined && args.searchString.length > 0) {
                searchQuery = {
                    OR: [
                        { product: { name: { contains: args.searchString.trim(), mode: 'insensitive' } } },
                        { product: { traits: { some: { value: { contains: args.searchString.trim(), mode: 'insensitive' } } } } }
                    ]
                }
            }
            let onlyInStockQuery;
            if (!args.onlyInStock) onlyInStockQuery = { availability: { gt: 0 } };
            return await context.prisma.sku.findMany({
                where: {
                    ...idQuery,
                    ...searchQuery,
                    ...onlyInStockQuery
                },
                orderBy: sortQuery,
                ...(new PrismaSelect(info).value)
            });
        }
    },
    Mutation: {
        uploadAvailability: async (_parent: undefined, args: any, _context: any, _info: any) => {
            const { createReadStream, filename, mimetype } = await args.file;
            const stream = createReadStream();
            const { ext } = path.parse(filename)
            const newFilename = `private/availability-${Date.now()}${ext}`;
            const { success, filename: finalFileName } = await saveFile(stream, newFilename, mimetype, false, ['.csv', '.xls', '.xlsx', 'text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/comma-separated-values', 'text/x-comma-separated-values']);
            if (success) uploadAvailability(finalFileName);
            return success;
        },
        addSku: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.sku.create((new PrismaSelect(info).value), { data: { ...args.input } })
        },
        updateSku: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.sku.update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteSkus: async (_parent: undefined, args: any, context: any, _info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.sku.deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}