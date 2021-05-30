import { gql } from 'apollo-server-express';
import { db } from '../db';
import { TABLES } from '../tables';
import bcrypt from 'bcrypt';
import { CODE } from '@local/shared';
import { ACCOUNT_STATUS, SESSION_MILLI } from '@local/shared';
import { CustomError } from '../error';
import { generateToken } from '../../auth';
import moment from 'moment';
import { BUSINESS_FIELDS } from './business';
import { EMAIL_FIELDS } from './email';
import { PHONE_FIELDS } from './phone';
import { ORDER_FIELDS } from './order';
import { ROLE_FIELDS } from './role';
import { FEEDBACK_FIELDS } from './feedback';
import { fullSelectQuery } from '../query';

export const HASHING_ROUNDS = 8;
const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15 * 60;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Fields that can be exposed in a query
export const USER_FIELDS = [
    'id',
    'firstName',
    'lastName',
    'pronouns',
    'theme',
    'lastLoginAttempt',
    'sessionToken',
    'accountApproved',
    'emailVerified',
    'status',
    'businessId'
]

const relationships = [
    ['one', 'business', TABLES.Business, BUSINESS_FIELDS, 'businessId'],
    ['many', 'emails', TABLES.Email, EMAIL_FIELDS, 'userId'],
    ['many', 'phones', TABLES.Phone, PHONE_FIELDS, 'userId'],
    ['many', 'orders', TABLES.Order, ORDER_FIELDS, 'userId'],
    ['many-many', 'roles', TABLES.Role, TABLES.UserRoles, ROLE_FIELDS, 'userId', 'roleId'],
    ['many', 'feedback', TABLES.Feedback, FEEDBACK_FIELDS, 'userId']
];

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
            marketingEmails: Boolean!
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
        users: async (_, args, context, info) => {
            // Only admins can query addresses
            //if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);

            return fullSelectQuery(info, args.ids, TABLES.User, relationships);
        }
    },
    Mutation: {
        login: async (_, args, context, info) => {
            console.log('yeeettt', info)
            // Validate email address
            const email = await db(TABLES.Email).select('emailAddress', 'userId').where('emailAddress', args.email).whereNotNull('userId').first();
            if (email === undefined) {
                return new CustomError(CODE.BadCredentials);
            }
            // Find user
            let user = await db(TABLES.User).where('id', email.userId).first();
            if (user === undefined) return new CustomError(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (args.verification_code === user.id && user.emailVerified === false) {
                user = await db(TABLES.User).where('id', user.id).update({
                    status: ACCOUNT_STATUS.Unlocked,
                    emailVerified: true
                }).returning('*')[0];
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            const last_login = moment(user.lastLoginAttempt, DATE_FORMAT).valueOf();
            console.log('LAST LOGIN', user.lastLoginAttempt, last_login);
            if (!unable_to_reset.includes(user.status) && moment().valueOf() - last_login > SOFT_LOCKOUT_DURATION_SECONDS) {
                console.log('nnnnn', user)
                user = await db(TABLES.User).where('id', user.id).update({
                    loginAttempts: 0
                }).returning('*').then(rows => rows[0]);
                console.log('oooo', user)
            }
            // Before validating password, let's check to make sure the account is unlocked
            const status_to_code = {
                [ACCOUNT_STATUS.Deleted]: CODE.NoUser,
                [ACCOUNT_STATUS.SoftLock]: CODE.SoftLockout,
                [ACCOUNT_STATUS.HardLock]: CODE.HardLockout
            }
            if (user.status in status_to_code) return new CustomError(status_to_code[user.status]);
            // Now we can validate the password
            console.log('eee', args.password, user, user.password)
            const validPassword = bcrypt.compareSync(args.password, user.password);
            if (validPassword) {
                const token = generateToken(user.id, user.businessId);
                await db(TABLES.User).where('id', user.id).update({
                    sessionToken: token,
                    loginAttempts: 0,
                    lastLoginAttempt: moment().format(DATE_FORMAT),
                    resetPasswordCode: null
                }).returning('*').then(rows => rows[0]);
                const cookie = { user: user };
                context.res.cookie('session', cookie, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: SESSION_MILLI
                });
                return (await fullSelectQuery(info, [user.id], TABLES.User, relationships))[0];
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = user.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await db(TABLES.User).where('id', user.id).update({
                    status: new_status,
                    loginAttempts: login_attempts,
                    lastLoginAttempt: moment().format(DATE_FORMAT)
                })
                return new CustomError(CODE.BadCredentials);
            }
        }
    }
}