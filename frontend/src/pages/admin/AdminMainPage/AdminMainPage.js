import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminMainPage } from './AdminMainPage.styled';
import { useHistory } from 'react-router-dom';
import { BUSINESS_NAME, LINKS } from 'utils/consts';
import { getTheme } from 'utils/storage';

function AdminMainPage({
    theme = getTheme(),
}) {
    let history = useHistory();

    useLayoutEffect(() => {
        document.title = `Admin Portal | ${BUSINESS_NAME}`;
    }, [])

    const card_data = [
        ['orders', 'Orders', "Approve, create, and edit customer's orders"],
        ['customers', 'Customers', "Approve new customers, edit customer information"],
        ['inventory', 'Inventory', "Add, remove, and update inventory"],
        ['gallery', 'Gallery', "Add, remove, and rearrange gallery images"],
        ['contact-info', 'Contact Info', "Edit business hours and other contact information"],
    ]

    return (
        <StyledAdminMainPage className="page" theme={theme}>
            <div className="header">
                <h1>Admin Portal</h1>
            </div>
            <div className="flexed">
                {card_data.map(([link, title, description]) => (
                    <div className="admin-card"
                        onClick={() => history.push(`${LINKS.Admin}/${link}`)}>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>
                ))}
            </div>
        </StyledAdminMainPage >
    );
}

AdminMainPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminMainPage;