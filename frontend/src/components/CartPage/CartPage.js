import React, { useLayoutEffect } from 'react';
import { StyledCartPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'consts';

function CartPage() {
    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })
    return (
        <StyledCartPage></StyledCartPage>
    );
}

CartPage.propTypes = {

}

export default CartPage;