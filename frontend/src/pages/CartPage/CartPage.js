import { useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledCartPage } from './CartPage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import { getTheme, getCart } from 'utils/storage';
import Button from 'components/Button/Button';

function CartPage({
    theme = getTheme(),
    cart = getCart(),
}) {

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

    const cart_item_to_row = (data) => {
        return (
            <tr><td>TODO</td></tr>
        );
    }

    return (
        <StyledCartPage className="page" theme={theme}>
            <h1>Cart</h1>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart?.map(c => cart_item_to_row(c))}
                </tbody>
            </table>
            <Button>Update Cart</Button>
            <Button>Finalize Order</Button>
        </StyledCartPage>
    );
}

CartPage.propTypes = {
    theme: PropTypes.object,
    cart: PropTypes.object,
}

export default CartPage;