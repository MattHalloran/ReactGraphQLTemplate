import express from 'express';

const router = express.Router();

router.put('/cart', (req, res) => {
    // ''Updates the cart for the specified user.
    // Only admins can update other carts.
    // Returns the updated cart data, so the frontend can verify update'''
    // (cart) = getData('cart')
    // # If changing a cart that doesn't belong to them, verify admin
    // user_id = cart['customer']['id']
    // if verify_admin():
    //     user = UserHandler.from_id(user_id)
    // else:
    //     user = verify_session()
    // if not user:
    //     return StatusCodes['UNAUTHORIZED']
    // cart_obj = OrderHandler.from_id(cart['id'])
    // if cart_obj is None:
    //     print('Error: Could not find cart')
    //     return StatusCodes['ERROR_UNKNOWN']
    // OrderHandler.update_from_dict(cart_obj, cart)
    // db.session.commit()
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "cart": OrderHandler.to_dict(cart_obj)
    // }
})

router.put('/submit_order', (req, res) => {
    // let cart = req.body.cart;
    // # If changing a cart that doesn't belong to them, verify admin
    // user = verify_customer()
    // if not user:
    //     return StatusCodes['UNAUTHORIZED']
    // cart_obj = OrderHandler.from_id(cart['id'])
    // if cart_obj is None:
    //     return StatusCodes['ERROR_UNKNOWN']
    // OrderHandler.update_from_dict(cart_obj, cart)
    // OrderHandler.set_status(cart_obj, OrderStatus['PENDING'])
    // new_cart = OrderHandler.create(user.id)
    // db.session.add(new_cart)
    // user.orders.append(new_cart)
    // db.session.commit()
    // q.enqueue(order_notify_admin)
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "cart": OrderHandler.to_dict(cart_obj)
    // }
})

router.route('/profile')
    .get((req, res) => {
        // (tag) = getJson('tag')
        // # Only admins can view information for other profiles
        // if tag != request.headers['session']['tag'] and not verify_admin():
        //     return StatusCodes['UNAUTHORIZED']
        // if not verify_customer():
        //     return StatusCodes['UNAUTHORIZED']
        // user_data = UserHandler.get_profile_data(tag)
        // if user_data is None:
        //     print('FAILEDDDD')
        //     return StatusCodes['ERROR_UNKNOWN']
        // print('SUCESS BABYYYYY')
        // return {
        //     **StatusCodes['SUCCESS'],
        //     "user": user_data
        // }
    }).post((req, res) => {
        // (tag, data) = getData('tag', 'data')
        // # Only admins can view information for other profiles
        // if tag != request.headers['session']['tag'] and not verify_admin():
        //     return StatusCodes['UNAUTHORIZED']
        // if not verify_customer():
        //     return StatusCodes['UNAUTHORIZED']
        // user = verify_session()
        // if not user:
        //     return StatusCodes['NOT_VERIFIED']
        // if not UserHandler.is_password_valid(user, data['currentPassword']):
        //     return StatusCodes['BAD_CREDENTIALS']
        // if UserHandler.update(user, data):
        //     return {
        //         **StatusCodes['SUCCESS'],
        //         "profile": UserHandler.get_profile_data(tag)
        //     }
        // return StatusCodes['ERROR_UNKNOWN']
    })

module.exports = router;