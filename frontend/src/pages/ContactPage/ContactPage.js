import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledContactPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'utils/consts';

function ContactPage() {
    useLayoutEffect(() => {
        document.title = `Contact | ${BUSINESS_NAME}`;
    })
    return (
        <StyledContactPage className="page"></StyledContactPage>
    );
}

ContactPage.propTypes = {
}


export default ContactPage;