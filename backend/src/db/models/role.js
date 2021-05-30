import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import { pathExists } from './pathExists';
import { CODE } from '@local/shared';

// Fields that can be exposed in a query
export const ROLE_FIELDS = [
    'id',
    'title',
    'description'
];

export const typeDef = gql`
    type Role {
        id: ID!
        title: String!
        description: String
        users: [User!]!
    }

    extend type Query {
        roles(ids: [ID!]): [Role!]!
    }

    extend type Mutation {
        addRole(
            title: String!
        ): Role!
        updateRole(
            id: ID!
            title: String
            description: String
        ): Role!
        deleteRole(
            id: ID!
        ): Response
        setRoleAssociations(
            roleId: ID!
            userIds: [ID!]!
        ): Response
    }
`

export const resolvers = {
    
}