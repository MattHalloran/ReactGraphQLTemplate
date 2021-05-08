import express, { json } from 'express';
import { CODE } from '@local/shared';
import { orderNotifyAdmin } from '../worker/email/queue';
import * as auth from '../auth';
import { Order, User } from '../db/models';
import { ORDER_STATUS } from '../db/types';

const router = express.Router();

router.put('/cart', auth.requireCustomer, (req, res) => {
    const cart_data = req.body.cart;
    let cart = await Order.query().withGraphFetched('user').findById(cart_data.id)[0];
    const user_id = cart.user.id;
    // Only admins can submit another user's cart
    if (req.token.user_id !== user_id && req.role !== 'admin') {
        return res.sendStatus(CODE.Unauthorized);
    }
    // Update cart object
    cart = cart.patchAndFetchById(cart.id, cart_data);
    return res.json(cart);
})

router.put('/submit_order', auth.requireCustomer, (req, res) => {
    const cart_data = req.body.cart;
    let cart = await Order.query().withGraphFetched('user').findById(cart_data.id)[0];
    const user_id = cart.user.id;
    // Only admins can submit another user's cart
    if (req.token.user_id !== user_id && req.role !== 'admin') {
        return res.sendStatus(CODE.Unauthorized);
    }
    // Update cart object, and set status to pending
    cart = cart.patchAndFetchById(cart.id, {
        ...cart_data,
        status: ORDER_STATUS.Pending
    });
    // Assign a new, empty cart to the user
    const new_cart = await Order.query().insertAndFetch({ userId: user_id });
    // Send a new order email to the main admin
    orderNotifyAdmin()
})

router.route('/profile')
    .get(auth.requireCustomer, (req, res) => {
        const profile_id = req.body.id;
        // Only admins can view information for other profiles
        if (req.token.user_id !== profile_id && req.role !== 'admin') {
            return res.sendStatus(CODE.Unauthorized);
        }
        let user = await User.query().findById(profile_id);
        return res.json(user);
    }).post(auth.requireCustomer, (req, res) => {
        const profile_id = req.body.id;
        // Only admins can edit information for other profiles
        if (req.token.user_id !== profile_id && req.role !== 'admin') {
            return res.sendStatus(CODE.Unauthorized);
        }
        // If currentPassword is valid, set data's password to newPassword
        let user_data = req.body.data;
        const passwordValid = await User.verifyPassword(req.body.currentPassword);
        if (passwordValid) req.body.password = req.body.newPassword;
        let user = await User.query().patchAndFetchById(profile_id, user_data);
        return res.json(user);
    })

module.exports = router;