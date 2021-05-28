import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import bcrypt from 'bcrypt';
import { pathExists } from './pathExists';
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
        signUp(
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
    AccountStatus: ACCOUNT_STATUS,
    Mutation: {
        login: async (_, args, context) => {
            // Validate email address
            const email = await db(TABLES.Email).select('emailAddress, userId').where('emailAddress', req.body.email).whereNotNull('userId').first();
            if (email === null) {
                return context.res.sendStatus(CODE.BadCredentials);
            }
            // Find user
            let user = await db(TABLES.User).findById(email.userId);
            if (user === null) return context.res.sendStatus(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (context.req.verification_code !== null && user.emailVerified === false) {
                user = await db(TABLES.User).patchAndFetchById(user.id, {
                    status: ACCOUNT_STATUS.Unlocked,
                    emailVerified: true
                })
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            if (!unable_to_reset.includes(user.status) && 
                Date.now() - user.lastLoginAttempt > SOFT_LOCKOUT_DURATION_SECONDS) {
                user = await db(TABLES.User).patchAndFetchById(user.id, {
                    loginAttempts: 0
                })
            }
            // Before validating password, let's check to make sure the account is unlocked
            const status_to_code = {
                [ACCOUNT_STATUS.Deleted]: CODE.NoUser,
                [ACCOUNT_STATUS.SoftLock]: CODE.SoftLockout,
                [ACCOUNT_STATUS.HardLock]: CODE.HardLockout
            }
            if (user.status in status_to_code) return context.res.sendStatus(status_to_code[user.status]);
            // Now we can validate the password
            const validPassword = bcrypt.compareSync(context.req.password, user.password);
            if (validPassword) {
                const token = auth.generateToken(user.id, user.businessId);
                user = await db(TABLES.User).patchAndFetchById(user.id, { 
                    sessionToken: token,
                    loginAttempts: 0,
                    lastLoginAttempt: Date.now(),
                    resetPasswordCode: null
                });
                const cookie = {user: user};
                return context.res.cookie('session', cookie, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: SESSION_MILLI
                })
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = user.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await db(TABLES.User).patchById(user.id, {
                    status: new_status,
                    loginAttempts: login_attempts,
                    lastLoginAttempt: Date.now()
                })
                return context.res.sendStatus(CODE.BadCredentials);
            }
        }
    }
}