import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledContactPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import { getTheme } from 'utils/storage';

function ContactPage({
    theme = getTheme(),
}) {
    useLayoutEffect(() => {
        document.title = `Contact | ${BUSINESS_NAME}`;
    })
    return (
        <StyledContactPage className="page" theme={theme}></StyledContactPage>
    );
}

ContactPage.propTypes = {
    theme: PropTypes.object,
}


export default ContactPage;