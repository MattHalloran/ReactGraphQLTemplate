import { gql } from 'apollo-server-express';
import { db } from '../db';
import bcrypt from 'bcrypt';
import { CODE, COOKIE } from '@local/shared';
import { ACCOUNT_STATUS } from '@local/shared';
import { CustomError } from '../error';
import { generateToken, setCookie } from '../../auth';
import moment from 'moment';
import { fullSelectQueryHelper } from '../query';
import { UserModel as Model } from '../relationships';
import { TABLES } from '../tables';

export const HASHING_ROUNDS = 8;
const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15 * 60;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

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
        business: Business
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
        profile: User!
    }

    extend type Mutation {
        login(
            email: String
            password: String,
            verificationCode: String
        ): User!
        logout: Boolean
        # Creates a business, then creates a user belonging to that business
        signUp(
            firstName: String!
            lastName: String!
            pronouns: String
            businessName: String!
            email: String!
            phone: String!
            existingCustomer: Boolean!
            marketingEmails: Boolean!
            password: String!
        ): User!
        updateUser(
            firstName: String
            lastName: String
            pronouns: String!
            theme: String!
            status: AccountStatus
            marketingEmails: Boolean!
            currentPassword: String!
            newPassword: String!
        ): User!
        deleteUser(
            id: ID!
            password: String
            confirmPassword: String
        ): Response
        requestPasswordChange(
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
    Query: {
        users: async (_, args, { req }, info) => {
            // Only admins can query
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return fullSelectQueryHelper(Model, info, args.ids);
        },
        profile: async (_, _a, { req }, info) => {
            // Can only query your own profile
            const userId = req.token.userId;
            if (userId === null || userId === undefined) return new CustomError(CODE.Unauthorized);
            const results = await fullSelectQueryHelper(Model, info, [userId]);
            return results[0];
        }
    },
    Mutation: {
        login: async (_, args, { req, res }, info) => {
            // If username and password wasn't passed, then use the session cookie data to validate
            if (args.username === undefined && args.password === undefined) {
                if (req.roles.length > 0) return (await fullSelectQueryHelper(Model, info, [req.userId]))[0];
                return new CustomError(CODE.BadCredentials);
            }
            // Validate email address
            const email = await db(TABLES.Email).select('emailAddress', 'userId').where('emailAddress', args.email).whereNotNull('userId').first();
            if (email === undefined) return new CustomError(CODE.BadCredentials);
            // Find user
            let user = await db(Model.name).where('id', email.userId).first();
            if (user === undefined) return new CustomError(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (args.verification_code === user.id && user.emailVerified === false) {
                user = await db(Model.name).where('id', user.id).update({
                    status: ACCOUNT_STATUS.Unlocked,
                    emailVerified: true
                }).returning('*')[0];
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            const last_login = moment(user.lastLoginAttempt, DATE_FORMAT).valueOf();
            console.log('LAST LOGIN', user.lastLoginAttempt, last_login);
            if (!unable_to_reset.includes(user.status) && moment().valueOf() - last_login > SOFT_LOCKOUT_DURATION_SECONDS) {
                user = await db(Model.name).where('id', user.id).update({
                    loginAttempts: 0
                }).returning('*').then(rows => rows[0]);
            }
            // Before validating password, let's check to make sure the account is unlocked
            const status_to_code = {
                [ACCOUNT_STATUS.Deleted]: CODE.NoUser,
                [ACCOUNT_STATUS.SoftLock]: CODE.SoftLockout,
                [ACCOUNT_STATUS.HardLock]: CODE.HardLockout
            }
            if (user.status in status_to_code) return new CustomError(status_to_code[user.status]);
            // Now we can validate the password
            const validPassword = bcrypt.compareSync(args.password, user.password);
            if (validPassword) {
                const token = generateToken(user.id, user.businessId);
                await db(Model.name).where('id', user.id).update({
                    sessionToken: token,
                    loginAttempts: 0,
                    lastLoginAttempt: moment().format(DATE_FORMAT),
                    resetPasswordCode: null
                }).returning('*').then(rows => rows[0]);
                await setCookie(res, user.id, token);
                return (await fullSelectQueryHelper(Model, info, [user.id]))[0];
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = user.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await db(Model.name).where('id', user.id).update({
                    status: new_status,
                    loginAttempts: login_attempts,
                    lastLoginAttempt: moment().format(DATE_FORMAT)
                })
                return new CustomError(CODE.BadCredentials);
            }
        },
        logout: async (_, _args, { req, res }, _info) => {
            console.log('LOGOUT CALLEDDDDDDD')
            res.clearCookie(COOKIE.Session);
            await db(Model.name).where('id', req.userId).update({
                sessionToken: null
            })
        },
        signUp: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        updateUser: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        deleteUser: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        requestPasswordChange: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        changeUserStatus: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        addUserRole: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
        removeUserRole: async (_, args, { req, res }, info) => {
            return CustomError(CODE.NotImplemented);
        },
    }
}