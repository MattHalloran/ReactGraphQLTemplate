import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';
import pkg from '@prisma/client';
const { OrderStatus } = pkg;

export const typeDef = gql`
    enum OrderStatus {
        CANCELED_BY_ADMIN
        CANCELED_BY_CUSTOMER
        PENDING_CANCEL
        REJECTED
        DRAFT
        PENDING
        APPROVED
        SCHEDULED
        IN_TRANSIT
        DELIVERED
    }

    input OrderInput {
        id: ID
        status: OrderStatus
        specialInstructions: String
        desiredDeliveryDate: Date
        isDelivery: Boolean
        items: [OrderItemInput!]
    }

    type Order {
        id: ID!
        status: OrderStatus!
        specialInstructions: String
        desiredDeliveryDate: Date
        expectedDeliveryDate: Date
        isDelivery: Boolean
        address: Address
        customer: Customer!
        items: [OrderItem!]!
    }

    extend type Query {
        orders(ids: [ID!], status: OrderStatus, searchString: String): [Order!]!
    }

    extend type Mutation {
        updateOrder(input: OrderInput): Order!
        submitOrder(id: ID!): Boolean
        cancelOrder(id: ID!): OrderStatus
        deleteOrders(ids: [ID!]!): Count!
    }
`

const STATUS_TO_SORT = {
    [OrderStatus.CANCELED_BY_ADMIN]: { updated_at: 'desc' },
    [OrderStatus.CANCELED_BY_CUSTOMER]: { updated_at: 'desc' },
    [OrderStatus.PENDING_CANCEL]: { updated_at: 'desc' },
    [OrderStatus.REJECTED]: { updated_at: 'desc' },
    [OrderStatus.DRAFT]: { updated_at: 'desc' },
    [OrderStatus.PENDING]: { updated_at: 'desc' },
    [OrderStatus.APPROVED]: { expectedDeliveryDate: 'desc' },
    [OrderStatus.SCHEDULED]: { expectedDeliveryDate: 'desc' },
    [OrderStatus.IN_TRANSIT]: { expectedDeliveryDate: 'desc' },
    [OrderStatus.DELIVERED]: { expectedDeliveryDate: 'desc' },
}

export const resolvers = {
    OrderStatus: OrderStatus,
    Query: {
        orders: async (_parent, args, context, info) => {
            // Must be admin (customers query SKUs)
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            let idQuery;
            if (Array.isArray(args.ids)) { idQuery = { id: { in: args.ids } } }
            // Determine sort order
            let sortQuery = { updated_at: 'desc' };
            if (args.status) sortQuery = STATUS_TO_SORT[args.status];
            // If search string provided, match it with customer or business name.
            // Maybe in the future, this could also be matched to sku names and such
            let searchQuery;
            if (args.searchString !== undefined && args.searchString.length > 0) {
                searchQuery = {
                    OR: [
                        { customer: { firstName: { contains: args.searchString.trim(), mode: 'insensitive' } } },
                        { customer: { lastName: { contains: args.searchString.trim(), mode: 'insensitive' } } },
                        { customer: { business: { name: { contains: args.searchString.trim(), mode: 'insensitive' } } } }
                    ]
                }
            }
            return await context.prisma.order.findMany({
                where: {
                    ...idQuery,
                    ...searchQuery,
                    status: args.status ?? undefined,
                },
                orderBy: sortQuery,
                ...(new PrismaSelect(info).value)
            });
        },
    },
    Mutation: {
        updateOrder: async (_parent, args, context, info) => {
            // Must be admin, or updating your own
            const curr = await context.prisma.order.findUnique({
                where: { id: args.input.id },
                select: { id: true, customerId: true, status: true, items: { select: { id: true } } }
            });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            if (!context.req.isAdmin) {
                // Customers can only update their own orders in certain states
                const editable_order_statuses = [OrderStatus.DRAFT, OrderStatus.PENDING];
                if (!editable_order_statuses.includes(curr.status))return new CustomError(CODE.Unauthorized);
                // Customers cannot edit order status
                delete args.input.status;
            }
            // Determine which order item rows need to be updated, and which will be deleted
            if (Array.isArray(args.input.items)) {
                const updatedItemIds = args.input.items.map(i => i.id);
                const deletingItemIds = curr.items.filter(i => !updatedItemIds.includes(i.id)).map(i => i.id);
                if (updatedItemIds.length > 0) {
                    const updateMany = args.input.items.map(d => context.prisma.order_item.updateMany({
                        where: { id: d.id },
                        data: { ...d }
                    }))
                    Promise.all(updateMany)
                }
                if (deletingItemIds.length > 0) {
                    await context.prisma.order_item.deleteMany({ where: { id: { in: deletingItemIds } } })
                }
            }
            return await context.prisma.order.update({
                where: { id: curr.id },
                data: { ...args.input, items: undefined },
                ...(new PrismaSelect(info).value)
            })
        },
        submitOrder: async (_parent, args, context, _info) => {
            // Must be admin, or submitting your own
            const curr = await context.prisma.order.findUnique({ where: { id: args.id } });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            // Only orders in the draft state can be submitted
            if (curr.status !== OrderStatus.DRAFT) return new CustomError(CODE.ErrorUnknown);
            await context.prisma.order.update({
                where: { id: curr.id },
                data: { status: OrderStatus.PENDING }
            });
            return true;
        },
        cancelOrder: async (_parent, args, context, _info) => {
            // Must be admin, or canceling your own
            const curr = await context.prisma.order.findUnique({ where: { id: args.id } });
            if (!context.req.isAdmin && context.req.customerId !== curr.customerId) return new CustomError(CODE.Unauthorized);
            let order_status = curr.status;
            // Only pending orders can be fully cancelled by customer
            if (curr.status === OrderStatus.PENDING) {
                order_status = OrderStatus.CANCELED_BY_CUSTOMER;
            }
            const pending_order_statuses = [OrderStatus.APPROVED, OrderStatus.SCHEDULED];
            if (curr.status in pending_order_statuses) {
                order_status = OrderStatus.PENDING_CANCEL;
            }
            await context.prisma.order.update({
                where: { id: curr.id },
                data: { status: order_status }
            })
            return order_status;
        },
        deleteOrders: async (_parent, args, context, _info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.order.deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}