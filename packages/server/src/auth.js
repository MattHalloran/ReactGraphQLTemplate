import jwt from 'jsonwebtoken';
import { CODE, COOKIE } from '@local/shared';
import { TABLES } from './db/tables';
import { db } from './db/db';
import { CustomError } from './db/error';

const SESSION_MILLI = 30*86400*1000;

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

// Verifies if a user is authenticated, using an http cookie
export async function authenticate(req, _, next) {
    const { cookies } = req;
    // First, check if a valid session cookie was supplied
    const token = cookies[COOKIE.Session];
    if (token === null || token === undefined) {
        next();
        return;
    }
    // Second, verify that the session token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
        if (error || isNaN(session.exp) || session.exp < Date.now()) {
            next();
            return;
        }
        // Now, set token and role variables for other middleware to use
        req.validToken = true;
        req.customerId = payload.customerId;
        req.roles = payload.roles;
        req.isCustomer = payload.isCustomer;
        req.isAdmin = payload.isAdmin;
        next();
    })
}

// Generates a JSON Web Token (JWT)
export async function generateToken(res, customerId) {
    const user_roles = await findCustomerRoles(customerId);
    const tokenContents = {
        iat: Date.now(),
        iss: `https://${process.env.SITE_NAME}/`,
        customerId: customer_id,
        roles: user_roles,
        isCustomer: customer_roles.includes('customer' || 'admin'),
        isAdmin: customer_roles.includes('admin'),
        exp: Date.now() + SESSION_MILLI,
    }
    const token = jwt.sign(tokenContents, process.env.JWT_SECRET, { expiresIn: SESSION_MILLI });
    res.cookie(COOKIE.Session, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MILLI
    });
}

// Middleware that requires a valid token
export async function requireToken(req, _, next) {
    if (req.token === null || req.token === undefined) return new CustomError(CODE.Unauthorized);
    next();
}

// Middleware that restricts access to customers (or admins)
export async function requireCustomer(req, _, next) {
    if (!req.isCustomer) return new CustomError(CODE.Unauthorized);
    next();
}

// Middle ware that restricts access to admins
export async function requireAdmin(req, _, next) {
    if (!req.isAdmin) return new CustomError(CODE.Unauthorized);
    next();
}