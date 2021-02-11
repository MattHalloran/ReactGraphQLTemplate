import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminOrderPage } from './AdminOrderPage.styled';
import { getTheme } from 'utils/storage';

function AdminOrderPage({
    theme = getTheme(),
}) {

    useLayoutEffect(() => {
        document.title = "Order Page";
    })

    return (
        <StyledAdminOrderPage className="page" theme={theme}>

        </StyledAdminOrderPage >
    );
}

AdminOrderPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminOrderPage;