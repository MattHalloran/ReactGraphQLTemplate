import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { LINKS } from 'utils/consts';

function AdminBreadcrumbs({...props}) {
    return (
            <Breadcrumbs separator="|" aria-label="Admin breadcrumb" {...props}>
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

export { AdminBreadcrumbs };