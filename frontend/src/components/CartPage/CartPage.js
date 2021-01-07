import React, { useLayoutEffect } from 'react';
import { StyledCartPage } from './ContactPage.styled';

function CartPage() {
    useLayoutEffect(() => {
        document.title = "Cart | New Life Nursery";
    })
    return (
        <StyledCartPage></StyledCartPage>
    );
}

CartPage.propTypes = {

}

export default CartPage;