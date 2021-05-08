import jwt from 'jsonwebtoken';
import { CODE } from '@local/shared';
import { TABLES } from './db/tables';
import { User } from './db/models';
import { SESSION_DAYS } from 'shared'

// Generates a JSON Web Token (JWT)
export function generateToken(user_id) {
    return jwt.sign(user_id, process.env.COOKIE_SECRET, { expiresIn: SESSION_DAYS*86400 })
}

// Middleware that requires a valid token
export async function requireToken(req, res, next) {
    const { cookies } = req;
    if (!('session' in cookies)) return res.sendStatus(CODE.Unauthorized);
    jwt.verify(cookies.session, process.env.COOKIE_SECRET, (error, user_id) => {
        if (error) return res.sendStatus(CODE.Unauthorized);
        req.token = { user_id: user_id }
        next();
    })
}

// Middleware that restricts access to customers (or admins)
export async function requireCustomer(req, res, next) {
    requireToken(req, res, async function () {
        const roles = await User.relatedQuery(TABLES.Role).for(req.token.user_id).select('title');
        if (!roles?.includes('customer' || 'admin')) return res.sendStatus(CODE.Unauthorized);
        req.role = roles.includes('admin') ? 'admin' : 'customer';
        next();
    });
}

// Middle ware that restricts access to admins
export async function requireAdmin(req, res, next) {
    requireToken(req, res, async function () {
        const roles = await User.relatedQuery(TABLES.Role).for(req.token.user_id).select('title');
        if (!roles?.includes('admin')) return res.sendStatus(CODE.Unauthorized);
        next();
    });
}