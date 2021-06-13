import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { CODE } from '@local/shared';
import { TASK_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { fullSelectQueryHelper } from '../query';

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
    TaskStatus: TASK_STATUS,
    Query: {
        tasks: async (_, args, { req }) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            let ids = args.ids;
            if (args.status !== null) {
                const ids_query = await db(TABLES.Task)
                    .select('id')
                    .where('status', args.status);
                ids = ids_query.filter(q => q.id);
            }
            return fullSelectQueryHelper(null, TABLES.Task, ids, []);
        }
    }
}