import {
    inputObjectType,
} from 'nexus';

export const BusinessInput = inputObjectType({
    name: 'BusinessInput',
    definition(t) {
        t.nonNull.string('name')
        t.boolean('subscribedToNewsletters')
        t.list.nonNull.id('discountIds')
        t.list.nonNull.id('employeeIds')
    },
})