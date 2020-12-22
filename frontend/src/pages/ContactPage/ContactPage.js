import React from 'react';
import { StyledContactPage } from './ContactPage.styled';

class ContactPage extends React.Component {
    componentDidMount() {
        document.title = "Contact | New Life Nursery"
    }
    render() {
        return (
            <StyledContactPage></StyledContactPage>
        );
    }
}

ContactPage.propTypes = {
    
}

export default ContactPage;