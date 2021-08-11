import {
    inputObjectType,
} from 'nexus';

export const EmailInput = inputObjectType({
    name: 'EmailInput',
    definition(t) {
        t.nonNull.string('emailAddress')
        t.boolean('receivesDeliveryUpdates')
        t.id('userId')
        t.id('businessId')
    },
})