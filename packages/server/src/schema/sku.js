import {
    enumType,
    inputObjectType,
} from 'nexus';
import { SKU_STATUS } from '@local/shared';

export const SkuStatus = enumType({
    name: 'SkuStatus',
    members: Object.values(SKU_STATUS),
})

export const SkuInput = inputObjectType({
    name: 'SkuInput',
    definition(t) {
        t.nonNull.string('sku')
        t.boolean('isDiscountable')
        t.string('size')
        t.string('note')
        t.int('availability')
        t.string('price')
        t.field('status', { type: 'SkuStatus' })
        t.id('plantId')
        t.list.nonNull.id('discountIds')
    },
})