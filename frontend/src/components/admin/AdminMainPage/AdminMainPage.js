import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { StyledAdminMainPage } from './AdminMainPage.styled';

class AdminMainPage extends React.Component {
    constructor(props) {
        super(props);
        this.cardClicked = this.cardClicked.bind(this);
    }

    componentDidMount() {
        document.title = "Admin Portal | New Life Nursery";
    }

    cardClicked(link) {
        this.props.history.push(link);
    }
    
    render() {
        return (
            <StyledAdminMainPage>
                <h1>Admin Portal</h1>
                <div className="flexed">
                    <AdminCard 
                        link="/admin/orders"
                        title="Orders" 
                        onClick={this.cardClicked}
                        description="Approve, create, and edit customer's orders" />
                    <AdminCard 
                        link="/admin/customers"
                        title="Customers" 
                        onClick={this.cardClicked}
                        description="Approve new customers, edit customer information" />
                    <AdminCard 
                        link="/admin/inventory"
                        title="Inventory"
                        onClick={this.cardClicked}
                        description="Add, remove, and update inventory"/>
                    <AdminCard 
                        link="/admin/plant-info" 
                        title="Plant Info" 
                        description="Edit details and images for plants" />
                    <AdminCard 
                        link="/admin/gallery" 
                        title="Gallery" 
                        onClick={this.cardClicked}
                        description="Add, remove, and rearrange gallery images" />
                    <AdminCard 
                        link="/admin/contact-info" 
                        title="Contact Info" 
                        onClick={this.cardClicked}
                        description="Edit business hours and other contact information" />
                </div>
            </StyledAdminMainPage >
        );
    }
}

AdminMainPage.propTypes = {

}

export default withRouter(AdminMainPage);

class AdminCard extends React.Component {
    constructor(props) {
        super(props)
        this.clicked = this.clicked.bind(this);
    }

    clicked() {
        this.props.onClick(this.props.link);
    }

    render() {
        return(
            <div className="admin-card" onClick={this.clicked}>
                <h3>{this.props.title}</h3>
                <p>{this.props.description}</p>
            </div>
        );
    }
}

AdminCard.propTypes = {
    link: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
}