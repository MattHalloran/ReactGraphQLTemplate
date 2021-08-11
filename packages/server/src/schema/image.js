import {
    enumType,
    inputObjectType,
} from 'nexus';

export const ImageSize = enumType({
    name: 'ImageSize',
    members: ['XS', 'S', 'M', 'ML', 'L'],
})

export const ImageUpdate = inputObjectType({
    name: 'ImageUpdate',
    definition(t) {
        t.nonNull.string('src')
        t.string('alt')
        t.string('description')
    },
})