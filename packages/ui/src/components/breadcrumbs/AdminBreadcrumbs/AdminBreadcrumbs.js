import React from 'react';
import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { LINKS } from 'utils';
import { useHistory } from 'react-router-dom';

// Breadcrumbs reload all components if using href directly. Not sure why
function AdminBreadcrumbs({...props}) {
    const history = useHistory()
    return (
            <Breadcrumbs separator="|" aria-label="Admin breadcrumb" {...props}>
                <Link onClick={() => history.push(LINKS.AdminOrders)}>Orders</Link>
                <Link onClick={() => history.push(LINKS.AdminCustomers)}>Customers</Link>
                <Link onClick={() => history.push(LINKS.AdminInventory)}>Inventory</Link>
                <Link onClick={() => history.push(LINKS.AdminHero)}>Hero</Link>
                <Link onClick={() => history.push(LINKS.AdminGallery)}>Gallery</Link>
                <Link onClick={() => history.push(LINKS.AdminContactInfo)}>Contact Info</Link>
            </Breadcrumbs>
    );
}

AdminBreadcrumbs.propTypes = {
}

export { AdminBreadcrumbs };