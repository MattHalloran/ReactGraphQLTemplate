import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminCustomerPage } from './AdminCustomerPage.styled';

class AdminCustomerPage extends React.Component {
    componentDidMount() {
        document.title = "Something here"
    }
    render() {
        return (
            <StyledAdminCustomerPage>
                
            </StyledAdminCustomerPage >
        );
    }
}

AdminCustomerPage.propTypes = {

}

export default AdminCustomerPage;