import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledCartPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'consts';
import { getTheme } from 'storage';

function CartPage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })
    return (
        <StyledCartPage theme={theme}></StyledCartPage>
    );
}

CartPage.propTypes = {
    theme: PropTypes.object,
}

export default CartPage;