import { gql } from 'apollo-server-express';
import { CODE, SKU_SORT_OPTIONS, SKU_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { 
    insertHelper, 
    deleteHelper, 
    selectQueryHelper, 
    updateHelper
} from '../query';
import { SkuModel as Model } from '../relationships';
import { saveFile } from '../../utils';
import { uploadAvailability } from '../../worker/uploadAvailability/queue';
import { db } from '../db';
import { TABLES } from '../tables';

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

    type Sku {
        id: ID!
        sku: String!
        isDiscountable: Boolean!
        size: String!
        note: String
        availability: Int!
        price: String!
        status: SkuStatus!
        plant: Plant!
        discounts: [Discount!]!
    }

    extend type Query {
        skus(ids: [ID!], sortBy: SkuSortBy): [Sku!]!
    }

    extend type Mutation {
        uploadAvailability(file: Upload!): Boolean
        addSku(input: SkuInput!): Sku!
        updateSku(input: SkuInput!): Sku!
        deleteSkus(ids: [ID!]!): Boolean
    }
`

export const resolvers = {
    SkuStatus: SKU_STATUS,
    SkuSortBy: SKU_SORT_OPTIONS,
    Query: {
        // Query all active SKUs
        skus: async (_, args, _c, info) => {
            // Filter out SKUs that aren't active
            const all_ids = await db(TABLES.Sku).select('id', 'availability', 'status');
            const filtered_ids = all_ids.filter(sku => sku.status === SKU_STATUS.Active);
            // TODO Sort
            const sortBy = args.sortBy || SKU_SORT_OPTIONS.AZ;
            return selectQueryHelper(Model, info, filtered_ids);
        }
    },
    Mutation: {
        uploadAvailability: async (_, args) => {
            const { createReadStream, mimetype } = await args.file;
            const stream = createReadStream();
            const filename = `private/availability-${Date.now()}.xls`;
            const { success, filename: finalFileName } = await saveFile(stream, filename, mimetype, false, ['application/vnd.ms-excel']);
            uploadAvailability(finalFileName);
            return success;
        },
        addSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await insertHelper({ model: Model, info: info, input: args.input });
        },
        updateSku: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await updateHelper({ model: Model, info: info, input: args.input });
        },
        deleteSkus: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteHelper(Model.name, args.ids);
        }
    }
}