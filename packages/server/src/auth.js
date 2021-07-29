import jwt from 'jsonwebtoken';
import { CODE, COOKIE } from '@local/shared';
import { TABLES } from './db/tables';
import { db } from './db/db';
import { CustomerModel } from './db/relationships';
import { fullSelectQuery } from './db/query';
import { CustomError } from './db/error';

const SESSION_MILLI = 30*86400;

// Return array of customer roles (ex: ['admin', 'customer'])
async function findCustomerRoles(customer_id) {
    // Query customer's roles. Will return titles in an array (ex: [{'customer'}, {'admin'}] )
    const roles_query = await db(TABLES.Customer)
        .select(`${TABLES.Role}.title`)
        .leftJoin(TABLES.CustomerRoles, `${TABLES.CustomerRoles}.customerId`, `${TABLES.Customer}.id`)
        .leftJoin(TABLES.Role, `${TABLES.Role}.id`, `${TABLES.CustomerRoles}.roleId`)
        .where(`${TABLES.Customer}.id`, customer_id);
    // Format query to an array of lowercase role titles
    return roles_query.map(r => r.title.toLowerCase());
}

// Sets the following request variables:
// token: the customer's verified session token, or none
// roles: the customer's roles, or none
// isCustomer: if the customer has a customer role
// isAdmin: if the customer has an admin role
export async function authenticate(req, _, next) {
    const { cookies } = req;
    // First, check if a session cookie was supplied
    const session = cookies[COOKIE.Session];
    console.log("SESSION COOKIE", session);
    console.log('all cookies', Object.keys(cookies))
    if (session === null || session === undefined) {
        next();
        return;
    }
    // Second, verify that the session token is valid
    const customer_id = session.id;
    const token = session.token;
    jwt.verify(token, process.env.JWT_SECRET, async (error, token) => {
        if (error) {
            next();
            return;
        }
        // Now, set token and role variables for other middleware to use
        req.token = token;
        req.customerId = customer_id;
        const customer_roles = await findCustomerRoles(customer_id);
        req.roles = customer_roles;
        req.isCustomer = customer_roles.includes('customer' || 'admin');
        req.isAdmin = customer_roles.includes('admin');
        next();
    })
}

// Generates a JSON Web Token (JWT)
export function generateToken(customerId, businessId) {
    return jwt.sign({
        customerId: customerId,
        businessId: businessId
    }, process.env.JWT_SECRET, { expiresIn: SESSION_MILLI })
}

// Sets a session cookie
export async function setCookie(res, customer_id, token) {
    // Request roles and orders when querying for customer
    const customer = (await fullSelectQuery(CustomerModel, ['roles', 'orders'], [customer_id]))[0];
    const cookie = {
        id: customer_id,
        token: token,
        roles: customer.roles,
        theme: customer.theme,
        orders: customer.orders
    };
    console.log('SETTING COOKIE', COOKIE.Session, SESSION_MILLI, cookie);
    res.cookie(COOKIE.Session, cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MILLI
    });
}

// Middleware that requires a valid token
export async function requireToken(req, res, next) {
    if (req.token === null || req.token === undefined) return new CustomError(CODE.Unauthorized);
    next();
}

// Middleware that restricts access to customers (or admins)
export async function requireCustomer(req, res, next) {
    if (!req.isCustomer) return new CustomError(CODE.Unauthorized);
    next();
}

// Middle ware that restricts access to admins
export async function requireAdmin(req, res, next) {
    if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
    next();
}