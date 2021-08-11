import {
    inputObjectType,
} from 'nexus';

export const RoleInput = inputObjectType({
    name: 'RoleInput',
    definition(t) {
        t.nonNull.string('title')
        t.string('description')
        t.list.nonNull.id('userIds')
    },
})