import React from 'react';
import PropTypes from 'prop-types';
import { StyledAdminPlantPage } from './AdminPlantPage.styled';

class AdminPlantPage extends React.Component {
    componentDidMount() {
        document.title = "Something here"
    }
    render() {
        return (
            <StyledAdminPlantPage>
                
            </StyledAdminPlantPage >
        );
    }
}

AdminPlantPage.propTypes = {

}

export default AdminPlantPage;