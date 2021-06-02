import express from 'express';
import { CODE, SESSION_MILLI } from '@local/shared';
import * as auth from '../auth';
import bcrypt from 'bcrypt';
import { customerNotifyAdmin, sendResetPasswordLink, sendVerificationLink } from '../worker/email/queue';
import { Email, Phone, User } from '../db/models';
import { ACCOUNT_STATUS } from '../src/db/types';
import { isPasswordValid } from '../db/models/password';

const router = express.Router();

const LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3;
const SOFT_LOCKOUT_DURATION_SECONDS = 15*60;
const LOGIN_ATTEMPTS_TO_HARD_LOCKOUT = 10;

router.post('/register', async (req, res) => {
    // Check if password is valid
    if (!isPasswordValid(req.body.password)) {
        return res.sendStatus(CODE.InvalidArgs);
    }
    // Check if email is in use
    let emails = await Email.query().where('emailAddress', req.body.emails[0].email_address);
    if (emails.length > 0) {
        return res.sendStatus(CODE.EmailInUse);
    }
    // Check if phone is in use
    let phones = await Phone.query().where('unformattedNumber', req.body.phones[0].unformatted_number);
    if (phones.length > 0) {
        return res.sendStatus(CODE.PhoneInUse);
    }
    // Create a new user
    let user = await db(TABLES.User).insert(req.body).returning('*')[0];
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
    const token = auth.generateToken(user.id, user.businessId);
    user = await db(TABLES.User).where('id', user.id).update({
        sessionToken: token
    }).returning('*');
    await auth.setCookie(res, user.id, token);
    // Notify admin of new customer via email
    customerNotifyAdmin(`${user.firstName} ${user.lastName}`);
    // Send email to new customer, so they can verify their email address
    sendVerificationLink(req.body.emails[0].email_address, user.id);
})

router.route('/reset-password').get(async (req, res) => {
    const user_ids = await Email.relatedQuery('user').where('email_address', req.body.email).select('id');
    if (user_ids.length === 0) return res.sendStatus(CODE.ErrorUnknown);
    // Generate unique code for resetting password
    const code = bcrypt.genSaltSync();
    await User.query().where('id', user_ids[0]).first().patch({ resetPasswordCode: code });
    sendResetPasswordLink(req.body.email, code);
}).post(async (req, res) => {
    // Check if valid link was clicked
    const user = await User.query().where('resetPasswordCode', req.body.code).limit(1);
    if (!user) return res.sendStatus(CODE.InvalidArgs);
    // Check if new password is valid
    if (!isPasswordValid(req.body.newPassword)) {
        return res.sendStatus(CODE.InvalidArgs);
    }
    // Check if old password is correct
    const passwordValid = User.verifyPassword(req.body.oldPassword);
    if (!passwordValid) return res.sendStatus(CODE.BadCredentials);
    // Now update the password
    await user.query().patch({ 
        resetPasswordCode: null,
        password: req.body.newPassword 
    });
})

// Middleware handles validation, so this is actually supposed to be empty
router.get('/validate-session', auth.requireToken)

module.exports = router;