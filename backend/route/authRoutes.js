import express from 'express';
import CODES from '../public/codes.json';
import * as auth from '../auth';
import Model from '../query/Model';
import { TABLES } from '../query/table/tables';
import { customerNotifyAdmin, sendResetPasswordLink, sendVerificationLink } from '../worker/email/queue';
import { Email, User } from '../db/models';
import { ACCOUNT_STATUS, TYPES } from '../db/types';

const router = express.Router();

const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15*60;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;

router.post('/register', (req, res) => {
    let email = req.body.emails[0];
    if ((new Model(TABLES.Email)).any('email_address', email.email_address)) {
        return res.sendStatus(CODES.EMAIL_IN_USE);
    }
    let phone = req.body.phones[0];
    // TODO check should be more robust
    if ((new Model(TABLES.Phone)).any('unformatted_Number', phone.unformatted_number)) {
        return res.sendStatus(CODES.PHONE_IN_USE);
    }
    //create user with req.body
    //generate token
    //await customerNotifyAdmin(`${req.body.first_name} ${req.body.last_name}`)
    //await sendVerificationLink(req.body.email, UserHandler.tag_from_email(email));
    await auth.generateHash(req.body.password);
    // res.cookie('session', somesessiontoken);
    // TODO: store the hash and session token in the user database
    //   return {
    //     "session": UserHandler.pack_session(user, token),
    //     "user": UserHandler.to_dict(user)
    //   }
})

router.put('/login', (req, res) => {
    // Handle email verification
    if (req.body.verification_code !== null) {
        let users = User.query().where('id', req.body.verification_code);
        let emails = Email.query().where('email_address', req.body.email);
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
    let email_ids = Email.query().where('email_address', req.body.email).select('id', 'userId');
    if (email_ids.length === 0) {
        return res.sendStatus(CODES.BAD_CREDENTIALS);
    }
    let user = User.query().findById(email_ids[0].userId);
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
    if (auth.verifyPhrase(user.password, req.body.password)) {
        const token = auth.generateToken(user.id);
        user = user.patchAndFetch({ 
            sessionToken: token,
            loginAttempts: 0,
            lastLoginAttempt: Date.now()
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

router.get('/reset-password', (req, res) => {
    const user_ids = Email.relatedQuery('user').where('email_address', req.body.email).select('id');
    if (user_ids.length === 0) return res.sendStatus(CODES.ERROR_UNKNOWN);
    sendResetPasswordLink(req.body.email, user_ids[0]);
})

// Middleware handles validation, so this is actually supposed to be empty
router.get('/validate-session', auth.requireToken, (_, res) => {
    next();
})

module.exports = router;