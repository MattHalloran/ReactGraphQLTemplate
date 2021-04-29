import express from 'express';
import argon2 from 'argon2';
import CODES from '../public/codes.json';
import * as auth from '../auth';

const router = express.Router();

router.post('/register', (req, res) => {
    //TODO if req.body.emails[0].email_address in database,
    //let err = CODES.EMAIL_IN_USE
    //return res.status(err.code).send(code.msg);
    //if req.body.phones[0].whatever in database,
    //let err = CODES.PHONE_IN_USE
    //return res.status(err.code).send(code.msg);
    //create user with req.body
    //generate token
    //enqueue email (customer_notify_admin, req.body.first_name req.body.last_name)
    //enqueue verification email (send_verification_link, req.body.email, UserHandler.tag_from_email(email))
    argon2.generateSalt().then(salt => {
        argon2.hash(req.body.password, salt).then(hash => {
          console.log('Successfully created Argon2 hash:', hash);
          // res.cookie('session', somesessiontoken);
          // TODO: store the hash and session token in the user database
        //   return {
        //     "session": UserHandler.pack_session(user, token),
        //     "user": UserHandler.to_dict(user)
        //   }
        });
      });
})

router.put('/login', (req, res) => {
    //TODO
    // if isinstance(req.body.verificationCode, str) and len(req.body.verificationCode) > 0:
    //     UserHandler.verify_email(req.body.email, req.body.verificationCode)
    // user = UserHandler.get_user_from_credentials(req.body.email, req.body.password)
    argon2.verify('previously-created-argon-hash-here', req.body.password).then(() => { 
        console.log('Successful password supplied!');
        // TODO: log the user in
      }).catch(() => {
        console.log('Invalid password supplied!');
      });
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
    //         q.enqueue(send_verification_link, email, UserHandler.tag_from_email(email))
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
    // q.enqueue(reset_password_link, email, UserHandler.tag_from_email(email))
    // return StatusCodes['SUCCESS']
})

// Middleware handles validation, so this can simply return true
router.get('/validate-session', auth.requireToken, (_, res) => {
    res.sendStatus(200);
})

module.exports = router;