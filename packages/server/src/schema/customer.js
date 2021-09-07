import { gql } from 'apollo-server-express';
import { TABLES } from '../db';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS, CODE, COOKIE, logInSchema, signUpSchema, requestPasswordChangeSchema } from '@local/shared';
import { CustomError, validateArgs } from '../error';
import { generateToken } from '../auth';
import { customerNotifyAdmin, sendResetPasswordLink, sendVerificationLink } from '../worker/email/queue';
import { HASHING_ROUNDS } from '../consts';
import { PrismaSelect } from '@paljs/plugins';
import { customerFromEmail, getCart, getCustomerSelect, upsertCustomer } from '../db/models/customer';

const _model = TABLES.Customer;
const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION = 15 * 60 * 1000;
const REQUEST_PASSWORD_RESET_DURATION = 2 * 24 * 3600 * 1000;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;

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
        fullName: String
        pronouns: String!
        emails: [Email!]!
        phones: [Phone!]!
        business: Business
        theme: String!
        accountApproved: Boolean!
        emailVerified: Boolean!
        status: AccountStatus!
        cart: Order
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
            email: String!
        ): Boolean
        resetPassword(
            code: String!
            newPassword: String!
        ): Customer!
        changeCustomerStatus(
            id: ID!
            status: AccountStatus!
        ): Boolean
        addCustomerRole(
            id: ID!
            roleId: ID!
        ): Customer!
        removeCustomerRole(
            id: ID!
            roleId: ID!
        ): Count!
    }
`

export const resolvers = {
    AccountStatus: ACCOUNT_STATUS,
    Query: {
        customers: async (_, _args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findMany((new PrismaSelect(info).value));
        },
        profile: async (_, _a, context, info) => {
            // Can only query your own profile
            console.log('in profile query', context.req.customerId)
            const customerId = context.req.customerId;
            if (customerId === null || customerId === undefined) return new CustomError(CODE.Unauthorized);
            console.log('validated. going to request')
            return await context.prisma[_model].findUnique({ where: { id: customerId }, ...(new PrismaSelect(info).value) });
        }
    },
    Mutation: {
        login: async (_, args, context, info) => {
            const prismaInfo = getCustomerSelect(info);
            // If username and password wasn't passed, then use the session cookie data to validate
            if (args.username === undefined && args.password === undefined) {
                if (context.req.roles && context.req.roles.length > 0) {
                    const cart = await getCart(context.prisma, info, context.req.customerId);
                    let userData = await context.prisma[_model].findUnique({ where: { id: context.req.customerId }, ...prismaInfo });
                    if (userData) {
                        if (cart) userData.cart = cart;
                        return userData;
                    }
                    context.res.clearCookie(COOKIE.Session);
                }
                return new CustomError(CODE.BadCredentials);
            }
            // Validate input format
            const validateError = await validateArgs(logInSchema, args);
            if (validateError) return validateError;
            // Get customer
            let customer = await customerFromEmail(args.email, context.prisma);
            console.log('GOT CUSTOMER', customer)
            // Validate verification code, if supplied
            if (args.verificationCode === customer.id && customer.emailVerified === false) {
                customer = await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { status: ACCOUNT_STATUS.Unlocked, emailVerified: true }
                })
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            if (!unable_to_reset.includes(customer.status) && Date.now() - new Date(customer.lastLoginAttempt).getTime() > SOFT_LOCKOUT_DURATION) {
                customer = await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { loginAttempts: 0 }
                })
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
                await generateToken(context.res, customer.id, customer.businessId);
                await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { 
                        loginAttempts: 0, 
                        lastLoginAttempt: new Date().toISOString(), 
                        resetPasswordCode: null, 
                        lastResetPasswordReqestAttempt: null 
                    },
                    ...prismaInfo
                })
                // Return cart, along with user data
                const cart = await getCart(context.prisma, info, customer.id);
                const userData = await context.prisma[_model].findUnique({ where: { id: customer.id }, ...prismaInfo });
                if (cart) userData.cart = cart;
                return userData;
            } else {
                let new_status = ACCOUNT_STATUS.Unlocked;
                let login_attempts = customer.loginAttempts + 1;
                if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.SoftLock;
                } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
                    new_status = ACCOUNT_STATUS.HardLock;
                }
                await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { status: new_status, loginAttempts: login_attempts, lastLoginAttempt: new Date().toISOString() }
                })
                return new CustomError(CODE.BadCredentials);
            }
        },
        logout: async (_, _args, context, _info) => {
            context.res.clearCookie(COOKIE.Session);
        },
        signUp: async (_, args, context, info) => {
            const prismaInfo = getCustomerSelect(info);
            // Validate input format
            const validateError = await validateArgs(signUpSchema, args);
            if (validateError) return validateError;
            // Find customer role to give to new user
            const customerRole = await context.prisma[TABLES.Role].findUnique({ where: { title: 'Customer' } });
            console.log('got customer role', customerRole)
            if (!customerRole) return new CustomError(CODE.ErrorUnknown);
            const customer = await upsertCustomer({
                prisma: context.prisma,
                info,
                data: {
                    firstName: args.firstName,
                    lastName: args.lastName,
                    pronouns: args.pronouns,
                    password: bcrypt.hashSync(args.password, HASHING_ROUNDS),
                    accountApproved: args.accountApproved,
                    status: ACCOUNT_STATUS.Unlocked,
                    emails: [{ emailAddress: args.email }],
                    phones: [{ number: args.phone }],
                    roles: [customerRole]
                }
            })
            await generateToken(context.res, customer.id, customer.businessId);
            // Send verification email
            sendVerificationLink(args.email, customer.id);
            // Send email to business owner
            customerNotifyAdmin(`${args.firstName} ${args.lastName}`);
            // Return cart, along with user data
            const cart = await getCart(context.prisma, info, customer.id);
            const userData = await context.prisma[_model].findUnique({ where: { id: customer.id }, ...prismaInfo });
            if (cart) userData.cart = cart;
            return userData;
        },
        updateCustomer: async (_, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin && (context.req.customerId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            // Check for correct password
            let customer = await context.prisma[_model].findUnique({ 
                where: { id: args.input.id },
                select: {
                    id: true,
                    password: true,
                    business: { select: { id: true } }
                }
            });
            if(!bcrypt.compareSync(args.currentPassword, customer.password)) return new CustomError(CODE.BadCredentials);
            const user = await upsertCustomer({
                prisma: context.prisma,
                info,
                data: args.input
            })
            console.log('UPSERTED USER', user);
            return user;
        },
        deleteCustomer: async (_, args, context) => {
            return new CustomError(CODE.NotImplemented);
        },
        requestPasswordChange: async (_, args, context) => {
            // Validate input format
            const validateError = await validateArgs(requestPasswordChangeSchema, args);
            if (validateError) return validateError;
            // Find customer in database
            const customer = await customerFromEmail(args.email, context.prisma);
            // Generate request code
            const requestCode = bcrypt.genSaltSync(HASHING_ROUNDS);
            console.log('REQUEST CODE IS', requestCode);
            // Store code and request time in customer row
            await context.prisma[_model].update({
                where: { id: customer.id },
                data: { resetPasswordCode: requestCode, lastResetPasswordReqestAttempt: new Date().toISOString() }
            })
            // Send email with correct reset link
            sendResetPasswordLink(args.email, requestCode);
            return true;
        },
        resetPassword: async(_, args, context, info) => {
            // Validate input format
            //TODO
            // Find customer in database
            const customer = await context.prisma[_model].findUnique({ 
                where: { requestPasswordCode: args.code },
                select: {
                    id: true,
                    emails: { select: { emailAddress: true } }
                }
            });
            if (!customer) return new CustomError(CODE.ErrorUnknown);
            // Verify request code and that request was made within 48 hours
            if (!bcrypt.compareSync(customer.resetPasswordCode, args.code) ||
                Date.now() - new Date(customer.lastResetPasswordReqestAttempt).getTime() > REQUEST_PASSWORD_RESET_DURATION) {
                // Generate new code
                const requestCode = bcrypt.genSaltSync(HASHING_ROUNDS);
                // Store code and request time in customer row
                await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { resetPasswordCode: requestCode, lastResetPasswordReqestAttempt: new Date().toISOString() }
                })
                // Send new verification email
                for (const email of customer.emails) {
                    sendResetPasswordLink(email.emailAddress, requestCode);
                }
                // Return error
                return new CustomError(CODE.INVALID_RESET_CODE);
            } 
            // Remove request data from customer, and set new password
            await context.prisma[_model].update({
                where: { id: customer.id },
                data: { 
                    resetPasswordCode: null, 
                    lastResetPasswordReqestAttempt: null,
                    password: bcrypt.hashSync(args.password, HASHING_ROUNDS)
                }
            })
            // Return customer data
            const prismaInfo = getCustomerSelect(info);
            const cart = await getCart(prisma, info, customer.id);
            const customerData = await prisma[TABLES.Customer].findUnique({ where: { id: customer.id }, ...prismaInfo });
            if (cart) customerData.cart = cart;
            return customerData;
        },
        changeCustomerStatus: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].update({
                where: { id: args.id },
                data: { status: args.status },
                ...(new PrismaSelect(info).value)
            })
        },
        addCustomerRole: async (_, args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            await context.prisma[TABLES.CustomerRoles].create({ data: { 
                customerId: args.id,
                roleId: args.roleId
            } })
            return await context.prisma[_model].findUnique({ where: { id: args.id }, ...(new PrismaSelect(info).value) });
        },
        removeCustomerRole: async (_, args, context) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma[TABLES.CustomerRoles].delete({ where: { 
                customerId: args.id,
                roleId: args.roleId
            } })
        },
    }
}