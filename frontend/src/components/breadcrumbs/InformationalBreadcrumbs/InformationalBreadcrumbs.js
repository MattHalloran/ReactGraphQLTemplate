import { LINKS } from 'utils/consts';
import { Breadcrumbs, Link } from '@material-ui/core';

function AdminBreadcrumbs({...props}) {
    return (
        <Breadcrumbs separator="|" aria-label="About us breadcrumb" {...props}>
            <Link href={LINKS.About}>About Us</Link>
            <Link href={LINKS.Gallery}>Gallery</Link>
        </Breadcrumbs>
    );
}

AdminBreadcrumbs.propTypes = {
}

export default AdminBreadcrumbs;