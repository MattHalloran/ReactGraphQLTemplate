import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledCartPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import { getTheme } from 'utils/storage';

function CartPage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })
    return (
        <StyledCartPage className="page" theme={theme}></StyledCartPage>
    );
}

CartPage.propTypes = {
    theme: PropTypes.object,
}

export default CartPage;