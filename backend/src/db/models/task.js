import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { TaskStatusType } from '../enums/taskStatus';

export const TaskType = new GraphQLObjectType({
    name: 'Task',
    description: 'A task corresponding to a background process, such as an emailer',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        taskId: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLNonNull(TaskStatusType)},
        description: { type: GraphQLString },
        result: { type: GraphQLString },
        resultCode: { type: GraphQLInt },
    })
})