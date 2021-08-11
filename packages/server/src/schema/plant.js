import {
    inputObjectType,
} from 'nexus';

export const PlantImage = inputObjectType({
    name: 'PlantImage',
    definition(t) {
        t.nonNull.list.nonNull.field('files', { type: 'Upload' })
        t.list.string('alts')
        t.nonNull.list.nonNull.string('labels')
    },
})

export const PlantTraitInput = inputObjectType({
    name: 'PlantTraitInput',
    definition(t) {
        t.nonNull.string('name')
        t.nonNull.string('value')
    },
})

export const PlantImageInput = inputObjectType({
    name: 'PlantImageInput',
    definition(t) {
        t.nonNull.string('src')
        t.string('alt')
        t.string('description')
        t.nonNull.list.nonNull.string('labels')
    },
})

export const PlantInput = inputObjectType({
    name: 'PlantInput',
    definition(t) {
        t.nonNull.string('latinName')
        t.string('textData')
        t.string('imageData')
    },
})