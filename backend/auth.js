import jwt from 'jsonwebtoken';
import CODES from './public/codes.json';
import Model from './query/Model';
import { TABLES } from './query/table/tables';
import User from './db/models/user';

// Salts and hashes a string
export async function generateHash(phrase) {
    argon2.generateSalt().then(salt => {
        argon2.hash(phrase, salt).then(hash => { return hash });
    });
}

// Returns true if the phrase matches the hash
export async function verifyPhrase(hash, phrase) {
    try {
        if (await argon2.verify(hash, phrase)) {
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}

// Generates a JSON Web Token (JWT)
export function generateToken(uuid) {
    return jwt.sign(uuid, process.env.COOKIE_SECRET, { expiresIn: '30 days' })
}

// Middleware that requires a valid token
export function requireToken(req, res, next) {
    const { cookies } = req;
    if (!('session' in cookies)) return res.sendStatus(CODES.UNAUTHORIZED);
    jwt.verify(cookies.session, process.env.COOKIE_SECRET, (error, uuid) => {
        if (error) return res.sendStatus(CODES.UNAUTHORIZED);
        req.token = { uuid: uuid }
        next();
    })
}

// Middleware that restricts access to customers (or admins)
export function requireCustomer(req, res, next) {
    requireToken(req, res, function () {
        const user = User.query().findById(req.token.uuid);
        let user_roles = (new Model(TABLES.Role)).select(['title'], `WHERE user_id = ${user.id}`);
        if (!user_roles?.includes('customer' || 'admin')) return res.sendStatus(CODES.UNAUTHORIZED);
        next();
    });
}

// Middle ware that restricts access to admins
export function requireAdmin(req, res, next) {
    requireToken(req, res, function () {
        const user = User.query().findById(req.token.uuid);
        let user_roles = (new Model(TABLES.Role)).select(['title'], `WHERE user_id = ${user.id}`);
        if (!user_roles?.includes('admin')) return res.sendStatus(CODES.UNAUTHORIZED);
        next();
    });
}