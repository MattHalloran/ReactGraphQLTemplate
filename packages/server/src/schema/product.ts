import { gql } from 'apollo-server-express';
import { CODE, PRODUCT_SORT_OPTIONS } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';
import pkg from '@prisma/client';
const { SkuStatus } = pkg;

export const typeDef = gql`

    input ProductTraitInput {
        name: String!
        value: String!
    }

    input ProductImageInput {
        hash: String!
        isDisplay: Boolean
    }

    input ProductInput {
        id: ID
        name: String!
        traits: [ProductTraitInput]!
        images: [ProductImageInput!]
        skus: [SkuInput!]
    }

    type ProductImage {
        index: Int!
        isDisplay: Boolean!
        image: Image!
    }

    type Product {
        id: ID!
        name: String!
        featured: Boolean!
        traits: [ProductTrait!]
        images: [ProductImage!]
        skus: [Sku!]
    }

    extend type Query {
        products(ids: [ID!], sortBy: SkuSortBy, searchString: String, active: Boolean): [Product!]!
    }

    extend type Mutation {
        addProduct(input: ProductInput!): Product!
        updateProduct(input: ProductInput!): Product!
        deleteProducts(ids: [ID!]!): Count!
    }
`

const SORT_TO_QUERY: {[key: string]: {}} = {
    [PRODUCT_SORT_OPTIONS.AZ]: { name: 'asc', },
    [PRODUCT_SORT_OPTIONS.ZA]: { name: 'desc' },
    [PRODUCT_SORT_OPTIONS.Newest]: { created_at: 'desc' },
    [PRODUCT_SORT_OPTIONS.Oldest]: { created_at: 'asc' },
}

export const resolvers = {
    Query: {
        products: async (_parent: undefined, args: any, context: any, info: any) => {
            let idQuery;
            if (Array.isArray(args.ids)) { idQuery = { id: { in: args.ids } } }
            // Determine sort order
            let sortQuery;
            if (args.sortBy !== undefined) sortQuery = SORT_TO_QUERY[args.sortBy];
            // If search string provided, match by name or trait name
            let searchQuery;
            if (args.searchString.length > 0) searchQuery = { OR: [
                { name: { contains: args.searchString.trim(), mode: 'insensitive' } },
                { traits: { some: { value: { contains: args.searchString.trim(), mode: 'insensitive' } } } }
            ] };
            // Toggle for showing active/inactive products (whether the product has any SKUs available to order)
            // Only admins can view inactive products
            let activeQuery;
            let activeQueryBase = { skus: {  some: { status: SkuStatus.ACTIVE } } };
            if (args.active === true) activeQuery = activeQueryBase;
            else if (args.active === false && context.req.isAdmin) activeQuery = { NOT: activeQueryBase };
            return await context.prisma.product.findMany({ 
                where: { 
                    ...idQuery,
                    ...searchQuery,
                    ...activeQuery
                },
                orderBy: sortQuery,
                ...(new PrismaSelect(info).value)
            });
        },
    },
    Mutation: {
        // Inserting products is different than other inserts, because the fields are dynamic.
        // Because of this, the add must be done manually
        // NOTE: images must be uploaded first
        addProduct: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            // Create product object
            const product = await context.prisma.product.create((new PrismaSelect(info).value), { data: { id: args.input.id, name: args.input.name } });
            // Create trait objects
            for (const { name, value } of (args.input.traits || [])) {
                await context.prisma.product_trait.create({ data: { productId: product.id, name, value } });
            }
            // Create images
            if (Array.isArray(args.input.images)) {
                for (let i = 0; i < args.input.length; i++) {
                    await context.prisma.product_images.create({ data: {
                        productId: product.id,
                        hash: args.input.images[i].hash,
                        isDisplay: args.input.images[i].isDisplay ?? false,
                        index: i
                    }})
                }
            }
            return await context.prisma.product.findUnique({ 
                where: { id: product.id },
                ...(new PrismaSelect(info).value)
            });
        },
        // NOTE: Images must be uploaded separately
        updateProduct: async (_parent: undefined, args: any, context: any, info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // Update images
            await context.prisma.product_images.deleteMany({ where: { productId: args.input.id } });
            if (Array.isArray(args.input.images)) {
                let rowIds = [];
                // Upsert passed in images
                for (let i = 0; i < args.input.images.length; i++) {
                    const curr = args.input.images[i];
                    const rowData = { productId: args.input.id, hash: curr.hash, index: i, isDisplay: curr.isDisplay ?? false };
                    const rowId = { productId: args.input.id, hash: curr.hash };
                    rowIds.push(rowId);
                    await context.prisma.product_images.upsert({
                        where: { product_images_productid_hash_unique: rowId },
                        update: rowData,
                        create: rowData
                    })
                }
                // Delete images not passed in
                await context.prisma.product_images.deleteMany({ 
                    where: {
                        AND: [
                            { productId: { in: rowIds.map(r => r.productId ) } },
                            { NOT: { hash: { in: rowIds.map(r => r.hash) } } }
                        ]
                    }
                })
            }
            // Update traits
            await context.prisma.product_trait.deleteMany({ where: { productId: args.input.id } });
            for (const { name, value } of (args.input.traits || [])) {
                const updateData = { productId: args.input.id, name, value };
                await context.prisma.product_trait.upsert({
                    where: { product_trait_productid_name_unique: { productId: args.input.id, name }},
                    update: updateData,
                    create: updateData
                })
            }
            // Update SKUs
            if (args.input.skus) {
                const currSkus = await context.prisma.sku.findMany({ where: { productId: args.input.id }});
                const deletedSkus = currSkus.map((s: any) => s.sku).filter((s: any) => !args.input.skus.some((sku: any) => sku.sku === s));
                await context.prisma.sku.deleteMany({ where: { sku: { in: deletedSkus } } });
                for (const sku of args.input.skus) {
                    await context.prisma.sku.upsert({
                        where: { sku: sku.sku},
                        update: sku,
                        create: { productId: args.input.id, ...sku }
                    })
                }
            }
            // Update name
            return await context.prisma.product.update({
                where: { id: args.input.id },
                data: { name: args.input.name },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteProducts: async (_parent: undefined, args: any, context: any, _info: any) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            // TODO handle images
            return await context.prisma.product.deleteMany({ where: { id: { in: args.ids } } });
        },
    }
}