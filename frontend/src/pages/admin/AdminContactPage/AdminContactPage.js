import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminContactPage } from './AdminContactPage.styled';

function AdminContactPage() {
    useLayoutEffect(() => {
        document.title = "Edit Contact Info";
    })
    return (
        <StyledAdminContactPage className="page">

        </StyledAdminContactPage>
    );
}

AdminContactPage.propTypes = {
}

export default AdminContactPage;