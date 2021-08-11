import {
    arg,
    inputObjectType, 
    nonNull, 
    list, 
    intArg, 
    extendType,
    objectType
} from 'nexus';

const _type = 'Address';

export const AddressInput = inputObjectType({
    name: 'AddressInput',
    definition(t) {
        t.string('tag')
        t.string('name')
        t.nonNull.string('country')
        t.nonNull.string('administrativeArea')
        t.string('subAdministrativeArea')
        t.nonNull.string('locality')
        t.nonNull.string('postalCode')
        t.nonNull.string('throughfare')
        t.string('premise')
        t.string('deliveryInstructions')
        t.nonNull.id('businessId')
    },
})

export const Address = objectType({
    name: _type,
    definition(t) {
        t.nonNull.id('id')
        t.string('tag')
        t.string('name')
        t.nonNull.string('country')
        t.nonNull.string('administrativeArea')
        t.string('subAdministrativeArea')
        t.nonNull.string('locality')
        t.nonNull.string('postalCode')
        t.nonNull.string('throughfare')
        t.string('premise')
        t.string('deliveryInstructions')
        t.nonNull.id('businessId')
        t.nonNull.field('business', {
            type: 'Business',
            resolve: (parent, _, context) => {
                return context.prisma.business.findUnique({
                    where: { id: parent.businessId || undefined },
                })
            }
        })
        t.nonNull.list.nonNull.field('orders', {
            type: 'Order',
            resolve: (parent, _, context) => {
                return context.prisma.order.findMany({
                    where: { addressId: parent.id || undefined },
                })
            }
        })
    },
})

export const Query = extendType({
    type: 'Query',
    definition(t) {
        t.field('addAddress', {
            type: _type,
            args: { input: nonNull(arg({ type: 'AddressInput' })) },
            resolve: (_, args, context) => {
                return context.prisma.address.create({ data: { ...args.input } })
            }
        })
    }
})

export const Mutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('addAddress', {
            type: _type,
            args: { input: nonNull(arg({ type: 'AddressInput' })) },
            resolve: async (_, args, context) => {
                return context.prisma.address.create({ data: { ...args.input } })
            }
        })
        t.field('updateAddress', {
            type: _type,
            args: { input: nonNull(arg({ type: 'AddressInput' })) },
            resolve: async (_, args, context) => {
                return context.prisma.address.update({
                    where: { id: args.id || undefined },
                    data: { ...args.input }
                })
            }
        })
        t.field('deleteAddresses', {
            type: 'Boolean',
            args: { ids: list(nonNull(intArg())) },
            resolve: async (_, args, context) => {
                return context.prisma.address.delete({
                    where: { id: { in: args.ids } }
                })
            }
        })
    }
})