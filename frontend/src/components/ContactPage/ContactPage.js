import React, { useLayoutEffect } from 'react';
import { StyledContactPage } from './ContactPage.styled';
import { BUSINESS_NAME } from 'consts';

function ContactPage() {
    useLayoutEffect(() => {
        document.title = `Contact | ${BUSINESS_NAME}`;
    })
    return (
        <StyledContactPage></StyledContactPage>
    );
}

ContactPage.propTypes = {
}


export default ContactPage;