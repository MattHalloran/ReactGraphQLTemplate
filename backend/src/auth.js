import jwt from 'jsonwebtoken';
import { CODE } from '@local/shared';
import { TABLES } from './db/tables';
import { SESSION_DAYS } from '@local/shared';
import { db } from './db/db';

// Sets the following request variables:
// token: the user's verified session token, or none
// roles: the user's roles, or none
// isCustomer: if the user has a customer role
// isAdmin: if the user has an admin role
export async function authenticate(req, _, next) {
    const { cookies } = req;
    // First, check is there is a session cookie
    if (!('session' in cookies)) {
        next();
        return;
    }
    // Second, verify that the session cookie is valid
    jwt.verify(cookies.session, process.env.COOKIE_SECRET, async (error, token) => {
        if (error) {
            next();
            return;
        }
        // Now, set token and role variables for other middleware to use
        req.token = token;
        // Query user's roles
        const user_roles = await db(TABLES.User)
                                .select(`${TABLES.Role}.title`)
                                .leftJoin(TABLES.UserRoles, `${TABLES.UserRoles}.userId`, `${TABLES.User}.id`)
                                .leftJoin(TABLES.Role, `${TABLES.Role}.id`, `${TABLES.UserRoles}.roleId`)
                                .where(`${TABLES.User}.id`, user_id);
        console.log('USER ROLES:', user_roles);
        req.roles = user_roles;
        req.isCustomer = user_roles.includes('customer' || 'admin');
        req.isAdmin = user_roles.includes('admin');
        next();
    })
}

// Generates a JSON Web Token (JWT)
export function generateToken(userId, businessId) {
    return jwt.sign({ 
        userId: userId, 
        businessId: businessId 
    }, process.env.COOKIE_SECRET, { expiresIn: SESSION_DAYS*86400 })
}

// Middleware that requires a valid token
export async function requireToken(req, res, next) {
    if (req.token === null || req.token === undefined) return res.sendStatus(CODE.Unauthorized);
    next();
}

// Middleware that restricts access to customers (or admins)
export async function requireCustomer(req, res, next) {
    if (!req.isCustomer) return res.sendStatus(CODE.Unauthorized);
    next();
}

// Middle ware that restricts access to admins
export async function requireAdmin(req, res, next) {
    if (!req.isAdmin) return res.sendStatus(CODE.Unauthorized);
    next();
}