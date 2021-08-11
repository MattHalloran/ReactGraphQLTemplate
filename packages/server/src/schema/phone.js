import {
    inputObjectType,
} from 'nexus';

export const PhoneInput = inputObjectType({
    name: 'PhoneInput',
    definition(t) {
        t.nonNull.string('number')
        t.nonNull.string('countryCode')
        t.string('extension')
        t.boolean('receivesDeliveryUpdates')
        t.id('userId')
        t.id('businessId')
    },
})