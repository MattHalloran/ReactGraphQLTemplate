import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminContactPage } from './AdminContactPage.styled';

class AdminContactPage extends React.Component {
    componentDidMount() {
        document.title = "Edit Contact Info"
    }
    render() {
        return (
            <StyledAdminContactPage>
                
            </StyledAdminContactPage >
        );
    }
}

AdminContactPage.propTypes = {

}

export default AdminContactPage;