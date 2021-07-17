import express from 'express';
import { CODE } from '@local/shared';
import bcrypt from 'bcrypt';
import { sendResetPasswordLink } from '../worker/email/queue';
import { Email, User } from '../db/models';
import { isPasswordValid } from '../db/models/password';

const router = express.Router();

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

module.exports = router;