import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { LINKS } from 'utils/consts';

function InformationalBreadcrumbs({...props}) {
    return (
        <Breadcrumbs separator="|" aria-label="About us breadcrumb" {...props}>
            <Link href={LINKS.About}>About Us</Link>
            <Link href={LINKS.Gallery}>Gallery</Link>
        </Breadcrumbs>
    );
}

InformationalBreadcrumbs.propTypes = {
}

export { InformationalBreadcrumbs };