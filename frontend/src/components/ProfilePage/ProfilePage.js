import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledProfilePage } from './ProfilePage.styled';
import { BUSINESS_NAME } from 'consts';
import { getTheme } from 'storage';

function ProfilePage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `Profile Page | ${BUSINESS_NAME}`;
    })

    return (
        <StyledProfilePage theme={theme}>
        </StyledProfilePage>
    );
}

ProfilePage.propTypes = {
    theme: PropTypes.object,
}

export default ProfilePage;