import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { StyledProfilePage } from './ProfilePage.styled';
import { BUSINESS_NAME } from 'consts';

function ProfilePage() {
    useLayoutEffect(() => {
        document.title = `Profile Page | ${BUSINESS_NAME}`;
    })

    return (
        <StyledProfilePage>
        </StyledProfilePage>
    );
}

ProfilePage.propTypes = {

}

export default ProfilePage;