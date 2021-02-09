import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminContactPage } from './AdminContactPage.styled';
import { getTheme } from 'utils/storage';

function AdminContactPage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = "Edit Contact Info";
    })
    return (
        <StyledAdminContactPage className="page" theme={theme}>

        </StyledAdminContactPage>
    );
}

AdminContactPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminContactPage;