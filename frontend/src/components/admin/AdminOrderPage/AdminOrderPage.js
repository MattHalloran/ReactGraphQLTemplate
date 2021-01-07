import React, { useLayoutEffect } from 'react';
import { StyledAdminOrderPage } from './AdminOrderPage.styled';

function AdminOrderPage() {
    useLayoutEffect(() => {
        document.title = "Something here";
    })
    return (
        <StyledAdminOrderPage>

        </StyledAdminOrderPage >
    );
}

AdminOrderPage.propTypes = {

}

export default AdminOrderPage;