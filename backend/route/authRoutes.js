import express from 'express';
import CODES from '../public/codes.json';
import * as auth from '../auth';
import Model from '../query/Model';
import { TABLES } from '../query/table/tables';
import { customerNotifyAdmin, sendResetPasswordLink, sendVerificationLink } from '../worker/email/queue';

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
    //TODO
    // if isinstance(req.body.verificationCode, str) and len(req.body.verificationCode) > 0:
    //     UserHandler.verify_email(req.body.email, req.body.verificationCode)
    // user = UserHandler.get_user_from_credentials(req.body.email, req.body.password)
    let verified = auth.verifyPhrase('previously-created-argon-hash-here', req.body.password);
    //   if user:
    //     if user.tag == "nenew":
    //         user.tag = salt(32)
    //     token = generate_token(app, user)
    //      res.cookie('session', token);
    //     print('RECEIVED TOKEN!!!!!!')
    //     UserHandler.set_token(user, token)
    //     db.session.commit()
    //     return {
    //         **StatusCodes['SUCCESS'],
    //         "user": UserHandler.to_dict(user),
    //         "session": UserHandler.pack_session(user, token),
    //         "isEmailVerified": user.account_status != AccountStatus.WAITING_EMAIL_VERIFICATION.value
    //     }
    // else:
    //     account_status = UserHandler.get_user_lock_status(email)
    //     print(f'User account status is {account_status}')
    //     status = StatusCodes['BAD_CREDENTIALS']
    //     if account_status == AccountStatus.WAITING_EMAIL_VERIFICATION.value:
    //         status = StatusCodes['EMAIL_NOT_VERIFIED']
    //         await sendVerificationLink(req.body.email, UserHandler.tag_from_email(email));
    //     elif account_status == AccountStatus.DELETED.value:
    //         status = StatusCodes['NO_USER']
    //     elif account_status == AccountStatus.SOFT_LOCK.value:
    //         status = StatusCodes['SOFT_LOCKOUT']
    //     elif account_status == AccountStatus.HARD_LOCK.value:
    //         status = StatusCodes['HARD_LOCKOUT']
    //     return status
})

router.get('/reset-password', (req, res) => {
    // email = getData('email')
    // await sendResetPasswordLink(req.body.email, UserHandler.tag_from_email(email));
    // return StatusCodes['SUCCESS']
})

// Middleware handles validation, so this can simply return true
router.get('/validate-session', auth.requireToken, (_, res) => {
    res.sendStatus(200);
})

module.exports = router;