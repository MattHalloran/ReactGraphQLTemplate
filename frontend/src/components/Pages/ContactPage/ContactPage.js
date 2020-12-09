import React from 'react';
import { StyledContactPage } from './ContactPage.styled';

export default class ContactPage extends React.Component {
    componentDidMount() {
        document.title = "Contact | New Life Nursery"
    }
    render() {
        return (
            <StyledContactPage></StyledContactPage>
        );
    }
}