import {
    enumType,
    inputObjectType,
} from 'nexus';
import { ORDER_STATUS } from '@local/shared';

export const OrderStatus = enumType({
    name: 'OrderStatus',
    members: Object.values(ORDER_STATUS),
})

export const OrderInput = inputObjectType({
    name: 'OrderInput',
    definition(t) {
        t.field('status', { type: 'OrderStatus' } )
        t.string('specialInstructions')
        t.field('desiredDeliveryDate', { type: 'DateTime' })
        t.boolean('isDelivery')
    },
})