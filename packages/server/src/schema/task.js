import {
    enumType,
    inputObjectType,
} from 'nexus';
import { TASK_STATUS } from '@local/shared';

export const TaskStatus = enumType({
    name: 'TaskStatus',
    members: Object.values(TASK_STATUS),
})