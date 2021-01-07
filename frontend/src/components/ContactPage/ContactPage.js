import React, { useLayoutEffect } from 'react';
import { StyledContactPage } from './ContactPage.styled';

function ContactPage() {
    useLayoutEffect(() => {
        document.title = "Contact | New Life Nursery";
    })
    return (
        <StyledContactPage></StyledContactPage>
    );
}

ContactPage.propTypes = {
}


export default ContactPage;