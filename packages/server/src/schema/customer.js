import { gql } from 'apollo-server-express';
import { db, TABLES } from '../db';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS, CODE, COOKIE, logInSchema, passwordSchema, signUpSchema, requestPasswordChangeSchema } from '@local/shared';
import { CustomError, validateArgs } from '../error';
import { generateToken } from '../auth';
import moment from 'moment';
import { customerNotifyAdmin, sendVerificationLink } from '../worker/email/queue';
import { HASHING_ROUNDS } from '../consts';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Customer;
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
        roles: [CustomerRole!]!
        feedback: [Feedback!]!
    }

    extend type Query {
        customers: [Customer!]!
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
        customers: async (_, _args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany();
        },
        profile: async (_, _a, context, info) => {
            // Can only query your own profile
            const customerId = context.req.token.customerId;
            if (customerId === null || customerId === undefined) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findUnique({ where: { id: customerId }, ...(new PrismaSelect(info).value) });
        }
    },
    Mutation: {
        login: async (_, args, context, info) => {
            // If username and password wasn't passed, then use the session cookie data to validate
            if (args.username === undefined && args.password === undefined) {
                if (context.req.roles && context.req.roles.length > 0) {
                    const data = await context.prisma[_model].findUnique({ where: { id: context.req.customerId }, ...(new PrismaSelect(info).value) });
                    if (data) return data;
                    context.res.clearCookie(COOKIE.Session);
                }
                return new CustomError(CODE.BadCredentials);
            }
            // Validate input format
            const validateError = await validateArgs(logInSchema, args);
            if (validateError) return validateError;
            // Validate email address
            const email = await db(TABLES.Email).select('emailAddress', 'customerId').where('emailAddress', args.email).whereNotNull('customerId').first();
            if (email === undefined) return new CustomError(CODE.BadCredentials);
            // Find customer
            let customer = await db(_model).where('id', email.customerId).first();
            if (customer === undefined) return new CustomError(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (args.verification_code === customer.id && customer.emailVerified === false) {
                customer = await db(_model).where('id', customer.id).update({
                    status: ACCOUNT_STATUS.Unlocked,
                    emailVerified: true
                }).returning('*')[0];
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            const last_login = moment(customer.lastLoginAttempt, DATE_FORMAT).valueOf();
            console.log('LAST LOGIN', customer.lastLoginAttempt, last_login);
            if (!unable_to_reset.includes(customer.status) && moment().valueOf() - last_login > SOFT_LOCKOUT_DURATION_SECONDS) {
                customer = await db(_model).where('id', customer.id).update({
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
                await generateToken(context.res, customer.id);
                await db(_model).where('id', customer.id).update({
                    loginAttempts: 0,
                    lastLoginAttempt: moment().format(DATE_FORMAT),
                    resetPasswordCode: null
                }).returning('*').then(rows => rows[0]);
                return await context.prisma[_model].findUnique({ where: { id: customer.id }, ...(new PrismaSelect(info).value) });
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = customer.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await db(_model).where('id', customer.id).update({
                    status: new_status,
                    loginAttempts: login_attempts,
                    lastLoginAttempt: moment().format(DATE_FORMAT)
                })
                return new CustomError(CODE.BadCredentials);
            }
        },
        logout: async (_, _args, context, _info) => {
            console.log('LOGOUT CALLEDDDDDDD')
            context.res.clearCookie(COOKIE.Session);
            await db(_model).where('id', context.req.customerId).update({
                sessionToken: null
            })
        },
        signUp: async (_, args, context, info) => {
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
            await generateToken(context.res, customer.id);
            // Send verification email
            sendVerificationLink(args.email, customer_id);
            // Send email to business owner
            customerNotifyAdmin(`${args.firstName} ${args.lastName}`);
            return await context.prisma[_model].findUnique({ where: { id: customer_id }, ...(new PrismaSelect(info).value) });
        },
        updateCustomer: async (_, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin && (context.req.token.customerId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            // Check for correct password
            const curr_password = (await db(_model).select('password').where('id', args.input.id))[0];
            if(!bcrypt.compareSync(args.currentPassword, curr_password.password)) return new CustomError(CODE.BadCredentials);
            // Update and query
            const result = await context.prisma[_model].update({
                where: { id: args.input.id || undefined },
                data: { ...args.input }
            })
            // Update password 
            if (args.newPassword) {
                // Validate new password
                const validatePasswordError = await validateArgs(passwordSchema, args.newPassword);
                if (validatePasswordError) return validatePasswordError;
                await db(_model).where('id', args.input.id).update({
                    password: bcrypt.hashSync(args.newPassword, HASHING_ROUNDS)
                })
            }
            return result;
        },
        deleteCustomer: async (_, args, context) => {
            return new CustomError(CODE.NotImplemented);
        },
        requestPasswordChange: async (_, args, context) => {
            // Validate input format
            const validateError = await validateArgs(requestPasswordChangeSchema, args);
            if (validateError) return validateError;
            return new CustomError(CODE.NotImplemented);
        },
        changeCustomerStatus: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            await db(_model).where('id', args.id).update({ status: args.status });
        },
        addCustomerRole: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            //return await insertJoinRows(Model, 'roles', args.id, [args.roleId]);
            return new CustomError(CODE.NotImplemented);
        },
        removeCustomerRole: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            //return await deleteJoinRows(Model, 'roles', args.id, [args.roleId]);
            return new CustomError(CODE.NotImplemented);
        },
    }
}