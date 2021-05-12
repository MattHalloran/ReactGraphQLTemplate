import { GraphQLEnumType } from 'graphql';
import { ORDER_STATUS } from '@local/shared';

export const TaskStatusType = GraphQLEnumType({
    name: 'Task status',
    description: 'The status of a background process',
    values: {
        
    }
})