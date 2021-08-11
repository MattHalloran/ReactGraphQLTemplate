import {
    inputObjectType,
} from 'nexus';

export const DiscountInput = inputObjectType({
    name: 'DiscountInput',
    definition(t) {
        t.nonNull.string('title')
        t.nonNull.float('discount')
        t.string('comment')
        t.string('terms')
        t.list.nonNull.id('businessIds')
        t.list.nonNull.id('skuIds')
    },
})