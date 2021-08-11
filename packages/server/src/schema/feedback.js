import {
    inputObjectType,
} from 'nexus';

export const FeedbackInput = inputObjectType({
    name: 'FeedbackInput',
    definition(t) {
        t.nonNull.string('text')
        t.id('userId')
    },
})