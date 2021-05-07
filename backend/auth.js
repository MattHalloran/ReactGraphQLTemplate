import jwt from 'jsonwebtoken';
import CODES from './public/codes.json';
import { TABLES } from './db/tables';
import { User } from './db/models';

// Generates a JSON Web Token (JWT)
export function generateToken(user_id) {
    return jwt.sign(user_id, process.env.COOKIE_SECRET, { expiresIn: '30 days' })
}

// Middleware that requires a valid token
export async function requireToken(req, res, next) {
    const { cookies } = req;
    if (!('session' in cookies)) return res.sendStatus(CODES.UNAUTHORIZED);
    jwt.verify(cookies.session, process.env.COOKIE_SECRET, (error, user_id) => {
        if (error) return res.sendStatus(CODES.UNAUTHORIZED);
        req.token = { user_id: user_id }
        next();
    })
}

// Middleware that restricts access to customers (or admins)
export async function requireCustomer(req, res, next) {
    requireToken(req, res, async function () {
        const roles = await User.relatedQuery(TABLES.Role).for(req.token.user_id).select('title');
        if (!roles?.includes('customer' || 'admin')) return res.sendStatus(CODES.UNAUTHORIZED);
        req.role = roles.includes('admin') ? 'admin' : 'customer';
        next();
    });
}

// Middle ware that restricts access to admins
export async function requireAdmin(req, res, next) {
    requireToken(req, res, async function () {
        const roles = await User.relatedQuery(TABLES.Role).for(req.token.user_id).select('title');
        if (!roles?.includes('admin')) return res.sendStatus(CODES.UNAUTHORIZED);
        next();
    });
}