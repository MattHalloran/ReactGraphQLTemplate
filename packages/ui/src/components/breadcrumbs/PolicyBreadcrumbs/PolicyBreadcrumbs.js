import React from 'react';
import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { LINKS } from 'utils';
import { useHistory } from 'react-router-dom';

function PolicyBreadcrumbs({...props}) {
    const history = useHistory();
    return (
        <Breadcrumbs separator="|" aria-label="Policies breadcrumb" {...props}>
            <Link onClick={() => history.push(LINKS.PrivacyPolicy)}>Privacy</Link>
            <Link onClick={() => history.push(LINKS.Terms)}>{'Terms & Conditions'}</Link>
        </Breadcrumbs>
    );
}

PolicyBreadcrumbs.propTypes = {
}

export { PolicyBreadcrumbs };