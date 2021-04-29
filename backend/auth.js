import jwt from 'jsonwebtoken';
import CODES from './public/codes.json';

export function generateToken(user_tag) {
    return jwt.sign(user_tag, process.env.COOKIE_SECRET, { expiresIn: '30 days' })
}

export function requireToken(req, res, next) {
    const { cookies } = req;
    if (!('session' in cookies)) return res.status(CODES.UNAUTHORIZED.code).send(CODES.UNAUTHORIZED.msg);
    jwt.verify(cookies.session, process.env.COOKIE_SECRET, (error, user_tag) => {
        if (error) return res.status(CODES.UNAUTHORIZED.code).send(CODES.UNAUTHORIZED.msg);
        req.user_tag = user_tag;
        next();
    })
}

export function requireCustomer(req, res, next) {
    requireToken(req, res, function(){
        //TODO get user from req.user_tag
        let user = 'TODO';
        // TODO check if user is customer or admin
        if (!true) return res.status(CODES.UNAUTHORIZED.code).send(CODES.UNAUTHORIZED.msg);
        next();
    });
}

export function requireAdmin(req, res, next) {
    requireToken(req, res, function(){
        //TODO get user from req.user_tag
        let user = 'TODO';
        // TODO check if user is admin
        if (!true) return res.status(CODES.UNAUTHORIZED.code).send(CODES.UNAUTHORIZED.msg);
        next();
    });
}