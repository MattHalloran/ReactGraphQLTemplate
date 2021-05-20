import { TASK_STATUS } from '@local/shared';
import { gql } from 'apollo-server-express';

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