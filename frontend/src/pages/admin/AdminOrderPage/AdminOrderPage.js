import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminOrderPage } from './AdminOrderPage.styled';

class AdminOrderPage extends React.Component {
    componentDidMount() {
        document.title = "Something here"
    }
    render() {
        return (
            <StyledAdminOrderPage>
                
            </StyledAdminOrderPage >
        );
    }
}

AdminOrderPage.propTypes = {

}

export default AdminOrderPage;