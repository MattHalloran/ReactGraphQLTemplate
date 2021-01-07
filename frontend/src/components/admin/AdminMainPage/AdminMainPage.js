import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminMainPage } from './AdminMainPage.styled';
import { useHistory } from "react-router-dom";

function AdminMainPage() {
    let history = useHistory();

    useLayoutEffect(() => {
        document.title = "Admin Portal | New Life Nursery";
    })

    const cardClicked = (link) => {
        history.push(link);
    }

    return (
        <StyledAdminMainPage>
            <h1>Admin Portal</h1>
            <div className="flexed">
                <AdminCard
                    link="/admin/orders"
                    title="Orders"
                    onClick={cardClicked}
                    description="Approve, create, and edit customer's orders" />
                <AdminCard
                    link="/admin/customers"
                    title="Customers"
                    onClick={cardClicked}
                    description="Approve new customers, edit customer information" />
                <AdminCard
                    link="/admin/inventory"
                    title="Inventory"
                    onClick={cardClicked}
                    description="Add, remove, and update inventory" />
                <AdminCard
                    link="/admin/plant-info"
                    title="Plant Info"
                    onClick={cardClicked}
                    description="Edit details and images for plants" />
                <AdminCard
                    link="/admin/gallery"
                    title="Gallery"
                    onClick={cardClicked}
                    description="Add, remove, and rearrange gallery images" />
                <AdminCard
                    link="/admin/contact-info"
                    title="Contact Info"
                    onClick={cardClicked}
                    description="Edit business hours and other contact information" />
            </div>
        </StyledAdminMainPage >
    );
}

AdminMainPage.propTypes = {

}

export default AdminMainPage;

function AdminCard(props) {

    const clicked = () => {
        props.onClick(props.link);
    }

    return (
        <div className="admin-card" onClick={clicked}>
            <h3>{props.title}</h3>
            <p>{props.description}</p>
        </div>
    );
}

AdminCard.propTypes = {
    link: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
}