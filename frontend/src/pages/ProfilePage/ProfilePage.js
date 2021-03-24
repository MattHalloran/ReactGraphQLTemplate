import { useLayoutEffect } from 'react';
import { StyledProfilePage } from './ProfilePage.styled';
import { BUSINESS_NAME } from 'utils/consts';

function ProfilePage() {

    useLayoutEffect(() => {
        document.title = `Profile Page | ${BUSINESS_NAME}`;
    })

    return (
        <StyledProfilePage className="page">
        </StyledProfilePage>
    );
}

ProfilePage.propTypes = {
    
}

export default ProfilePage;