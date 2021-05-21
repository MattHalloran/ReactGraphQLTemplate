import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import pathExists from './pathExists';
import { CODE } from '@local/shared';
import { ACCOUNT_STATUS } from '@local/shared';

export const HASHING_ROUNDS = 8;

export const typeDef = gql`
    enum AccountStatus {
        Deleted
        Unlocked
        SoftLock
        HardLock
    }

    type User {
        id: ID!
        firstName: String!
        lastName: String!
        pronouns: String!
        emails: [Email!]!
        phones: [Phone!]!
        business: Business!
        theme: String!
        accountApproved: Boolean!
        emailVerified: Boolean!
        status: AccountStatus!
        orders: [Order!]!
        roles: [Role!]!
        feedback: [Feedback!]!
    }

    extend type Query {
        users(ids: [ID!]): [User!]!
    }

    extend type Mutation {
        login(
            email: String!
            password: String!
        ): User!
        # Creates a business, then creates a user belonging to that business
        registerUser(
            firstName: String!
            lastName: String!
            pronouns: String
            businessName: String!
            email: String!
            phone: String!
            existingCustomer: Boolean!
            password: String!
        ): User!
        updateUser(
            firstName: String
            lastName: String
            pronouns: String!
            theme: String!
            accountApproved: Boolean!
            emailVerified: Boolean!
            status: AccountStatus!
            password: String!
            confirmPassword: String!
        ): User!
        deleteUser(
            id: ID!
            password: String
            confirmPassword: String
        ): Response
        sendPasswordResetEmail(
            id: ID
        ): Response
        changeUserStatus(
            id: ID!
            status: AccountStatus!
        ): Response
        addUserRole(
            id: ID!
            roleId: ID!
        ): Response
        removeUserRole(
            id: ID!
            roleId: ID!
        ): Response
    }
`

export const resolvers = {
    AccountStatus: ACCOUNT_STATUS
}