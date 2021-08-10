import { gql } from 'apollo-server-express';
import { db } from '../db';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS, CODE, COOKIE, logInSchema, passwordSchema, signUpSchema, requestPasswordChangeSchema } from '@local/shared';
import { CustomError, validateArgs } from '../error';
import { generateToken } from '../../auth';
import moment from 'moment';
import { 
    insertHelper, 
    deleteHelper, 
    insertJoinRows,
    selectQueryHelper, 
    updateHelper,
    deleteJoinRows
} from '../query';
import { CustomerModel as Model } from '../relationships';
import { TABLES } from '../tables';
import { customerNotifyAdmin, sendVerificationLink } from '../../worker/email/queue';

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

    input CustomerInput {
        id: ID
        firstName: String
        lastName: String
        pronouns: String
        emails: [EmailInput!]
        phones: [PhoneInput!]
        business: BusinessInput
        theme: String
        status: AccountStatus
        accountApproved: Boolean
    }

    type Customer {
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
        customers(ids: [ID!]): [Customer!]!
        profile: Customer!
    }

    extend type Mutation {
        login(
            email: String
            password: String,
            verificationCode: String
        ): Customer!
        logout: Boolean
        # Creates a business, then creates a customer belonging to that business
        signUp(
            firstName: String!
            lastName: String!
            pronouns: String
            business: String!
            email: String!
            phone: String!
            accountApproved: Boolean!
            marketingEmails: Boolean!
            password: String!
        ): Customer!
        updateCustomer(
            input: CustomerInput!
            currentPassword: String!
            newPassword: String
        ): Customer!
        deleteCustomer(
            id: ID!
            password: String
            confirmPassword: String
        ): Boolean
        requestPasswordChange(
            id: ID
        ): Response
        changeCustomerStatus(
            id: ID!
            status: AccountStatus!
        ): Boolean
        addCustomerRole(
            id: ID!
            roleId: ID!
        ): Boolean
        removeCustomerRole(
            id: ID!
            roleId: ID!
        ): Boolean
    }
`

export const resolvers = {
    AccountStatus: ACCOUNT_STATUS,
    Query: {
        customers: async (_, args, { req }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return selectQueryHelper(Model, info, args.ids);
        },
        profile: async (_, _a, { req }, info) => {
            // Can only query your own profile
            const customerId = req.token.customerId;
            if (customerId === null || customerId === undefined) return new CustomError(CODE.Unauthorized);
            const results = await selectQueryHelper(Model, info, [customerId]);
            return results[0];
        }
    },
    Mutation: {
        login: async (_, args, { req, res }, info) => {
            // If username and password wasn't passed, then use the session cookie data to validate
            if (args.username === undefined && args.password === undefined) {
                if (req.roles && req.roles.length > 0) return (await selectQueryHelper(Model, info, [req.customerId]))[0];
                return new CustomError(CODE.BadCredentials);
            }
            // Validate input format
            const validateError = await validateArgs(logInSchema, args);
            if (validateError) return validateError;
            // Validate email address
            const email = await db(TABLES.Email).select('emailAddress', 'customerId').where('emailAddress', args.email).whereNotNull('customerId').first();
            if (email === undefined) return new CustomError(CODE.BadCredentials);
            // Find customer
            let customer = await db(Model.name).where('id', email.customerId).first();
            if (customer === undefined) return new CustomError(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (args.verification_code === customer.id && customer.emailVerified === false) {
                customer = await db(Model.name).where('id', customer.id).update({
                    status: ACCOUNT_STATUS.Unlocked,
                    emailVerified: true
                }).returning('*')[0];
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            const last_login = moment(customer.lastLoginAttempt, DATE_FORMAT).valueOf();
            console.log('LAST LOGIN', customer.lastLoginAttempt, last_login);
            if (!unable_to_reset.includes(customer.status) && moment().valueOf() - last_login > SOFT_LOCKOUT_DURATION_SECONDS) {
                customer = await db(Model.name).where('id', customer.id).update({
                    loginAttempts: 0
                }).returning('*').then(rows => rows[0]);
            }
            // Before validating password, let's check to make sure the account is unlocked
            const status_to_code = {
                [ACCOUNT_STATUS.Deleted]: CODE.NoCustomer,
                [ACCOUNT_STATUS.SoftLock]: CODE.SoftLockout,
                [ACCOUNT_STATUS.HardLock]: CODE.HardLockout
            }
            if (customer.status in status_to_code) return new CustomError(status_to_code[customer.status]);
            // Now we can validate the password
            const validPassword = bcrypt.compareSync(args.password, customer.password);
            if (validPassword) {
                await generateToken(res, customer.id);
                await db(Model.name).where('id', customer.id).update({
                    loginAttempts: 0,
                    lastLoginAttempt: moment().format(DATE_FORMAT),
                    resetPasswordCode: null
                }).returning('*').then(rows => rows[0]);
                return (await selectQueryHelper(Model, info, [customer.id]))[0];
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = customer.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await db(Model.name).where('id', customer.id).update({
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
            await db(Model.name).where('id', req.customerId).update({
                sessionToken: null
            })
        },
        signUp: async (_, args, { req, res }, info) => {
            // Validate input format
            const validateError = await validateArgs(signUpSchema, args);
            if (validateError) return validateError;
            // Validate unique email address
            const email = await db(TABLES.Email).select('customerId').where('emailAddress', args.email).first();
            if (email !== undefined) return new CustomError(CODE.EmailInUse);
            // Validate unique phone number
            const phone = await db(TABLES.Phone).select('customerId').where('number', args.phone).first();
            if (phone !== undefined) return new CustomError(CODE.PhoneInUse);
            // Create business
            const business_id = (await db(TABLES.Business).insert([
                {
                    name: args.business,
                    subscribedToNewsletters: args.marketingEmails,
                }
            ]).returning('id'))[0];
            // Create customer
            const customer_id = (await db(TABLES.Customer).insert([
                {
                    firstName: args.firstName,
                    lastName: args.lastName,
                    pronouns: args.pronouns,
                    password: bcrypt.hashSync(args.password, HASHING_ROUNDS),
                    status: ACCOUNT_STATUS.Unlocked,
                    businessId: business_id,
                }
            ]).returning('id'))[0];
            // Create email
            await db(TABLES.Email).insert([
                {
                    emailAddress: args.email,
                    customerId: customer_id,
                    businessId: business_id
                }
            ]);
            // Create phone
            await db(TABLES.Phone).insert([
                {
                    number: args.phone,
                    customerId: customer_id,
                    businessId: business_id
                }
            ]);
            await generateToken(res, customer.id);
            // Send verification email
            sendVerificationLink(args.email, customer_id);
            // Send email to business owner
            customerNotifyAdmin(`${args.firstName} ${args.lastName}`);
            return (await selectQueryHelper(Model, info, [customer_id]))[0];
        },
        updateCustomer: async (_, args, { req, res }, info) => {
            // Must be admin, or updating your own
            if(!req.isAdmin && (req.token.customerId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            // Check for correct password
            const curr_password = (await db(Model.name).select('password').where('id', args.input.id))[0];
            if(!bcrypt.compareSync(args.currentPassword, curr_password.password)) return new CustomError(CODE.BadCredentials);
            // Update and query
            const result = await updateHelper({ model: Model, info: info, input: args.input });
            // Update password 
            if (args.newPassword) {
                // Validate new password
                const validatePasswordError = await validateArgs(passwordSchema, args.newPassword);
                if (validatePasswordError) return validatePasswordError;
                await db(Model.name).where('id', args.input.id).update({
                    password: bcrypt.hashSync(args.newPassword, HASHING_ROUNDS)
                })
            }
            return result;
        },
        deleteCustomer: async (_, args, { req, res }, info) => {
            return new CustomError(CODE.NotImplemented);
        },
        requestPasswordChange: async (_, args, { req, res }, info) => {
            // Validate input format
            const validateError = await validateArgs(requestPasswordChangeSchema, args);
            if (validateError) return validateError;
            return new CustomError(CODE.NotImplemented);
        },
        changeCustomerStatus: async (_, args, { req, res }, info) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            await db(Model.name).where('id', args.id).update({ status: args.status });
        },
        addCustomerRole: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await insertJoinRows(Model, 'roles', args.id, [args.roleId]);
        },
        removeCustomerRole: async (_, args, { req }) => {
            // Must be admin
            if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await deleteJoinRows(Model, 'roles', args.id, [args.roleId]);
        },
    }
}