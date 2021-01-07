import React, { useLayoutEffect } from 'react';
import { StyledAdminPlantPage } from './AdminPlantPage.styled';

function AdminPlantPage() {
    useLayoutEffect(() => {
        document.title = "Something here";
    })
    return (
        <StyledAdminPlantPage>

        </StyledAdminPlantPage>
    );
}

AdminPlantPage.propTypes = {

}

export default AdminPlantPage;