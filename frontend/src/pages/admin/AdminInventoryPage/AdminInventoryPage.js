import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminInventoryPage } from './AdminInventoryPage.styled';

class AdminInventoryPage extends React.Component {
    componentDidMount() {
        document.title = "Edit Inventory Info"
    }
    render() {
        return (
            <StyledAdminInventoryPage>
                
            </StyledAdminInventoryPage >
        );
    }
}

AdminInventoryPage.propTypes = {

}

export default AdminInventoryPage;