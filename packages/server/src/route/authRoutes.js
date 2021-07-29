import express from 'express';
import { CODE } from '@local/shared';
import bcrypt from 'bcrypt';
import { sendResetPasswordLink } from '../worker/email/queue';
import { Email, Customer } from '../db/models';
import { isPasswordValid } from '../db/models/password';

const router = express.Router();

router.route('/reset-password').get(async (req, res) => {
    const customer_ids = await Email.relatedQuery('customer').where('email_address', req.body.email).select('id');
    if (customer_ids.length === 0) return res.sendStatus(CODE.ErrorUnknown);
    // Generate unique code for resetting password
    const code = bcrypt.genSaltSync();
    await Customer.query().where('id', customer_ids[0]).first().patch({ resetPasswordCode: code });
    sendResetPasswordLink(req.body.email, code);
}).post(async (req, res) => {
    // Check if valid link was clicked
    const customer = await Customer.query().where('resetPasswordCode', req.body.code).limit(1);
    if (!customer) return res.sendStatus(CODE.InvalidArgs);
    // Check if new password is valid
    if (!isPasswordValid(req.body.newPassword)) {
        return res.sendStatus(CODE.InvalidArgs);
    }
    // Check if old password is correct
    const passwordValid = Customer.verifyPassword(req.body.oldPassword);
    if (!passwordValid) return res.sendStatus(CODE.BadCredentials);
    // Now update the password
    await customer.query().patch({ 
        resetPasswordCode: null,
        password: req.body.newPassword 
    });
})

module.exports = router;