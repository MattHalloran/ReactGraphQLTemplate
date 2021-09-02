import { gql } from 'apollo-server-express';
import { TABLES } from '../db';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS, CODE, COOKIE, logInSchema, ORDER_STATUS, passwordSchema, signUpSchema, requestPasswordChangeSchema } from '@local/shared';
import { CustomError, validateArgs } from '../error';
import { generateToken } from '../auth';
import { customerNotifyAdmin, sendVerificationLink } from '../worker/email/queue';
import { HASHING_ROUNDS } from '../consts';
import { PrismaSelect } from '@paljs/plugins';

const _model = TABLES.Customer;
const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15 * 60;
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
        fullName: String!
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
            id: ID
        ): Boolean
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

const getCart = async (prisma, info, customerId) => {
    const selectInfo = new PrismaSelect(info).value.select.cart;
    const results = await prisma[TABLES.Order].findMany({ 
        where: { customerId: customerId, status: ORDER_STATUS.Draft },
        ...selectInfo
    });
    return results.length > 0 ? results[0] : null;
}

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
            const customerId = context.req.customerId;
            if (customerId === null || customerId === undefined) return new CustomError(CODE.Unauthorized);
            return await context.prisma[_model].findUnique({ where: { id: customerId }, ...(new PrismaSelect(info).value) });
        }
    },
    Mutation: {
        login: async (_, args, context, info) => {
            console.log('login info', new PrismaSelect(info).value.select.cart)
            // First, remove 'cart' from the info object, as this will be added manually
            let prismaInfo = new PrismaSelect(info).value
            delete prismaInfo.select.cart;
            // If username and password wasn't passed, then use the session cookie data to validate
            if (args.username === undefined && args.password === undefined) {
                if (context.req.roles && context.req.roles.length > 0) {
                    const cart = getCart(context.prisma, info, context.req.customerId);
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
            // Validate email address
            const email = await context.prisma[TABLES.Email].findUnique({ where: { emailAddress: args.email } });
            if (!email) return new CustomError(CODE.BadCredentials);
            // Find customer
            let customer = await context.prisma[_model].findUnique({ where: { id: email.customerId } });
            if (!customer) return new CustomError(CODE.ErrorUnknown);
            // Validate verification code, if supplied
            if (args.verification_code === customer.id && customer.emailVerified === false) {
                customer = await context.prisma[_model].update({
                    where: { id: customer.id },
                    data: { status: ACCOUNT_STATUS.Unlocked, emailVerified: true }
                })
            }
            // Reset login attempts after 15 minutes
            const unable_to_reset = [ACCOUNT_STATUS.HardLock, ACCOUNT_STATUS.Deleted];
            if (!unable_to_reset.includes(customer.status) && Date.now() - new Date(customer.lastLoginAttempt).getTime() > SOFT_LOCKOUT_DURATION_SECONDS) {
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
                    data: { loginAttempts: 0, lastLoginAttempt: new Date().toISOString(), resetPasswordCode: null },
                    ...prismaInfo
                })
                // Return cart, along with user data
                const cart = getCart(context.prisma, info, customer.id);
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
            // First, remove 'cart' from the info object, as this will be added manually
            let prismaInfo = new PrismaSelect(info).value
            delete prismaInfo.select.cart;
            // Validate input format
            const validateError = await validateArgs(signUpSchema, args);
            if (validateError) return validateError;
            // Validate unique email address
            const email = await context.prisma[TABLES.Email].findUnique({ where: { emailAddress: args.email } });
            if (email) return new CustomError(CODE.EmailInUse);
            // Validate unique phone number
            const phone = await context.prisma[TABLES.Phone].findUnique({ where: { number: args.phone } });
            if (phone) return new CustomError(CODE.PhoneInUse);
            // Create business
            const business = await context.prisma[TABLES.Business].create({ data: { 
                name: args.business,
                subscribedToNewsletters: args.marketingEmails,
            } })
            // Create customer
            const customer = await context.prisma[_model].create({ data: { 
                firstName: args.firstName,
                lastName: args.lastName,
                pronouns: args.pronouns,
                password: bcrypt.hashSync(args.password, HASHING_ROUNDS),
                status: ACCOUNT_STATUS.Unlocked,
                businessId: business.id,
            } })
            // Create email
            await context.prisma[TABLES.Email].create({ data: { 
                emailAddress: args.email,
                customerId: customer.id,
                businessId: business.id
            } })
            // Create phone
            await context.prisma[TABLES.Phone].create({ data: { 
                number: args.phone,
                customerId: customer.id,
                businessId: business.id
            } })
            await generateToken(context.res, customer.id, customer.businessId);
            // Send verification email
            sendVerificationLink(args.email, customer.id);
            // Send email to business owner
            customerNotifyAdmin(`${args.firstName} ${args.lastName}`);
            // Return cart, along with user data
            const cart = getCart(context.prisma, info, customer.id);
            const userData = await context.prisma[_model].findUnique({ where: { id: customer.id }, ...prismaInfo });
            if (cart) userData.cart = cart;
            return userData;
        },
        updateCustomer: async (_, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin && (context.req.customerId !== args.input.id)) return new CustomError(CODE.Unauthorized);
            // Check for correct password
            let customer = await context.prisma[_model].findUnique({ where: { id: args.input.id } });
            if(!bcrypt.compareSync(args.currentPassword, customer.password)) return new CustomError(CODE.BadCredentials);
            // Update and query
            customer = await context.prisma[_model].update({
                where: { id: args.input.id },
                data: { ...args.input },
                ...prismaInfo
            })
            // Update password 
            if (args.newPassword) {
                // Validate new password
                const validatePasswordError = await validateArgs(passwordSchema, args.newPassword);
                if (validatePasswordError) return validatePasswordError;
                await context.prisma[_model].update({
                    where: { id: args.input.id },
                    data: { password: bcrypt.hashSync(args.newPassword, HASHING_ROUNDS) },
                })
            }
            return customer;
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