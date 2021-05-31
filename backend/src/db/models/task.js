import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { TASK_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQuery } from '../query';

// Fields that can be exposed in a query
export const TASK_FIELDS = [
    'id',
    'taskId',
    'name',
    'status',
    'description',
    'result',
    'resultCode'
];

export const typeDef = gql`
    enum TaskStatus {
        Unknown
        Failed
        Active
        Completed
    }

    type Task {
        id: ID!
        taskId: Int!
        name: String!
        status: TaskStatus!
        description: String
        result: String
        resultCode: Int
    }

    extend type Query {
        tasks(ids: [ID!], status: TaskStatus): [Task!]!
    }
`

export const resolvers = {
    TaskStatus: TASK_STATUS
}