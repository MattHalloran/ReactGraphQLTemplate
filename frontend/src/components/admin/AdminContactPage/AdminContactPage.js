import React, { useLayoutEffect } from 'react';
import { StyledAdminContactPage } from './AdminContactPage.styled';

function AdminContactPage() {
    useLayoutEffect(() => {
        document.title = "Edit Contact Info";
    })
    return (
        <StyledAdminContactPage>

        </StyledAdminContactPage >
    );
}

AdminContactPage.propTypes = {

}

export default AdminContactPage;