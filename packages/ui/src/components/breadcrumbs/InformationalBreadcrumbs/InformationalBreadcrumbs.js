import React from 'react';
import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { LINKS } from 'utils';
import { useHistory } from 'react-router-dom';

function InformationalBreadcrumbs({...props}) {
    const history = useHistory();
    return (
        <Breadcrumbs separator="|" aria-label="About us breadcrumb" {...props}>
            <Link onClick={() => history.push(LINKS.About)}>About Us</Link>
            <Link onClick={() => history.push(LINKS.Gallery)}>Gallery</Link>
        </Breadcrumbs>
    );
}

InformationalBreadcrumbs.propTypes = {
}

export { InformationalBreadcrumbs };