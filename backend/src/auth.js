import jwt from 'jsonwebtoken';
import { CODE, COOKIE } from '@local/shared';
import { TABLES } from './db/tables';
import { SESSION_MILLI } from '@local/shared';
import { db } from './db/db';
import { UserModel } from './db/relationships';
import { fullSelectQuery } from './db/query';

// Return array of user roles (ex: ['admin', 'customer'])
async function findUserRoles(user_id) {
    // Query user's roles. Will return titles in an array (ex: [{'customer'}, {'admin'}] )
    const roles_query = await db(TABLES.User)
        .select(`${TABLES.Role}.title`)
        .leftJoin(TABLES.UserRoles, `${TABLES.UserRoles}.userId`, `${TABLES.User}.id`)
        .leftJoin(TABLES.Role, `${TABLES.Role}.id`, `${TABLES.UserRoles}.roleId`)
        .where(`${TABLES.User}.id`, user_id);
    // Format query to an array of lowercase role titles
    return roles_query.map(r => r.title.toLowerCase());
}

// Sets the following request variables:
// token: the user's verified session token, or none
// roles: the user's roles, or none
// isCustomer: if the user has a customer role
// isAdmin: if the user has an admin role
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
    const user_id = session.id;
    const token = session.token;
    jwt.verify(token, process.env.COOKIE_SECRET, async (error, token) => {
        if (error) {
            next();
            return;
        }
        // Now, set token and role variables for other middleware to use
        req.token = token;
        req.userId = user_id;
        const user_roles = await findUserRoles(user_id);
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
    }, process.env.COOKIE_SECRET, { expiresIn: SESSION_MILLI })
}

// Sets a session cookie
export async function setCookie(res, user_id, token) {
    // Request roles and orders when querying for user
    const user = (await fullSelectQuery(UserModel, ['roles', 'orders'], [user_id]))[0];
    const cookie = {
        id: user_id,
        token: token,
        roles: user.roles,
        theme: user.theme,
        orders: user.orders
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