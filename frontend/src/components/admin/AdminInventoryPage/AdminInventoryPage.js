import React, { useLayoutEffect } from 'react';
import { StyledAdminInventoryPage } from './AdminInventoryPage.styled';

function AdminInventoryPage() {
    useLayoutEffect(() => {
        document.title = "Edit Inventory Info";
    })
    return (
        <StyledAdminInventoryPage>

        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {

}

export default AdminInventoryPage;