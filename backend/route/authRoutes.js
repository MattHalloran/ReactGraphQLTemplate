import express from 'express';
import CODES from '../public/codes.json';
import * as auth from '../auth';
import bcrypt from 'bcrypt';
import { customerNotifyAdmin, sendResetPasswordLink, sendVerificationLink } from '../worker/email/queue';
import { Email, Phone, User } from '../db/models';
import { ACCOUNT_STATUS, TYPES } from '../db/types';
import { isPasswordValid } from '../db/models/password';

const router = express.Router();

const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15*60;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;

router.post('/register', (req, res) => {
    // Check if password is valid
    if (!isPasswordValid(req.body.password)) {
        return res.sendStatus(CODES.INVALID_ARGS);
    }
    // Check if email is in use
    let emails = await Email.query().where('emailAddress', req.body.emails[0].email_address);
    if (emails.length > 0) {
        return res.sendStatus(CODES.EMAIL_IN_USE);
    }
    // Check if phone is in use
    let phones = await Phone.query().where('unformattedNumber', req.body.phones[0].unformatted_number);
    if (phones.length > 0) {
        return res.sendStatus(CODES.PHONE_IN_USE);
    }
    // Create a new user
    let user = await User.query().insert(req.body);
    // Associate email with user
    await Email.query().insert({
        ...req.body.emails[0],
        userId: user.id
    })
    // Associate phone with user
    await Phone.query().insert({
        ...req.body.phones[0],
        userId: user.id
    })
    // Generate session token
    const session = auth.generateToken(user.id);
    let user = await User.query().patch({
        sessionToken: session
    });
    res.cookie('session', session);
    customerNotifyAdmin(user.fullName())
    sendVerificationLink(req.body.emails[0].email_address, user.id);
    return res.json({
        //TODO
        //"session": UserHandler.pack_session(user, token),
        user: user
    })
})

router.put('/login', (req, res) => {
    // Handle email verification
    if (req.body.verification_code !== null) {
        let users = await User.query().where('id', req.body.verification_code);
        let emails = await Email.query().where('email_address', req.body.email);
        if (users.length === 1 && emails.length === 1) {
            users[0].patch({ 
                [TYPES.AccountStatus]: ACCOUNT_STATUS.Unlocked ,
                emailVerified: true
            });
        } else {
            return res.sendStatus(CODES.ERROR_UNKNOWN);
        }
    }
    // Validate email address
    let email_ids = await Email.query().where('email_address', req.body.email).select('id', 'userId');
    if (email_ids.length === 0) {
        return res.sendStatus(CODES.BAD_CREDENTIALS);
    }
    let user = await User.query().findById(email_ids[0].userId);
    // Reset login attempts after 15 minutes
    if (user[TYPES.AccountStatus] !== ACCOUNT_STATUS.HardLock && 
        user[TYPES.AccountStatus] !== ACCOUNT_STATUS.Deleted && 
        Date.now() - user.lastLoginAttempt > SOFT_LOCKOUT_DURATION_SECONDS) {
        user = user.patchAndFetch({
            loginAttempts: 0
        })
    }
    // Before validating password, let's check to make sure the account is unlocked
    const status = user[TYPES.AccountStatus];
    if (status === ACCOUNT_STATUS.Deleted) {
        return res.sendStatus(CODES.NO_USER);
    } else if (status === ACCOUNT_STATUS.SoftLock) {
        return res.sendStatus(CODES.SOFT_LOCKOUT);
    } else if (status === ACCOUNT_STATUS.HardLock) {
        return res.sendStatus(CODES.HARD_LOCKOUT);
    }
    // Now we can validate the password
    const passwordValid = await User.verifyPassword(req.body.password);
    if (passwordValid) {
        const token = auth.generateToken(user.id);
        user = user.patchAndFetch({ 
            sessionToken: token,
            loginAttempts: 0,
            lastLoginAttempt: Date.now(),
            resetPasswordCode: null
        });
        return res.json({
            //TODO
            //  "session": UserHandler.pack_session(user, token),
            user: user,
        })
    } else {
        let new_status = ACCOUNT_STATUS.Unlocked;
        let login_attempts = user.loginAttempts + 1;
        if (login_attempts >= LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT) {
            new_status = ACCOUNT_STATUS.SoftLock;
        } else if (login_attempts > LOGIN_ATTEMPTS_TO_HARD_LOCKOUT) {
            new_status = ACCOUNT_STATUS.HardLock;
        }
        user.patch({
            [TYPES.AccountStatus]: new_status,
            loginAttempts: login_attempts,
            lastLoginAttempt: Date.now()
        })
        return res.sendStatus(CODES.BAD_CREDENTIALS);
    }
})

router.route('/reset-password').get((req, res) => {
    const user_ids = await Email.relatedQuery('user').where('email_address', req.body.email).select('id');
    if (user_ids.length === 0) return res.sendStatus(CODES.ERROR_UNKNOWN);
    // Generate unique code for resetting password
    const code = bcrypt.genSaltSync();
    await User.query().findById(user_ids[0]).patch({ resetPasswordCode: code });
    sendResetPasswordLink(req.body.email, code);
}).post((req, res) => {
    // Check if valid link was clicked
    const user = await User.query().where('resetPasswordCode', req.body.code).limit(1);
    if (!user) return res.sendStatus(CODES.INVALID_ARGS);
    // Check if new password is valid
    if (!isPasswordValid(req.body.newPassword)) {
        return res.sendStatus(CODES.INVALID_ARGS);
    }
    // Check if old password is correct
    const passwordValid = User.verifyPassword(req.body.oldPassword);
    if (!passwordValid) return res.sendStatus(CODES.BAD_CREDENTIALS);
    // Now update the password
    await user.query().patch({ 
        resetPasswordCode: null,
        password: req.body.newPassword 
    });
})

// Middleware handles validation, so this is actually supposed to be empty
router.get('/validate-session', auth.requireToken, (_, res) => {
    next();
})

module.exports = router;