import { LINKS } from 'utils/consts';
import { Breadcrumbs, Link } from '@material-ui/core';

function AdminBreadcrumbs() {
    return (
            <Breadcrumbs separator="|" aria-label="Admin breadcrumb">
                <Link href={LINKS.AdminOrders}>Orders</Link>
                <Link href={LINKS.AdminCustomers}>Customers</Link>
                <Link href={LINKS.AdminInventory}>Inventory</Link>
                <Link href={LINKS.AdminGallery}>Gallery</Link>
                <Link href={LINKS.AdminContactInfo}>Contact Info</Link>
            </Breadcrumbs>
    );
}

AdminBreadcrumbs.propTypes = {
}

export default AdminBreadcrumbs;