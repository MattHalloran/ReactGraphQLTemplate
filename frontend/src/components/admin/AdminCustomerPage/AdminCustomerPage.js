import React, { useLayoutEffect } from 'react';
import { StyledAdminCustomerPage } from './AdminCustomerPage.styled';

function AdminCustomerPage() {
    useLayoutEffect(() => {
        document.title = "Something here";
    })
    return (
        <StyledAdminCustomerPage>

        </StyledAdminCustomerPage >
    );
}

AdminCustomerPage.propTypes = {

}

export default AdminCustomerPage;