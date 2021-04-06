import { LINKS } from 'utils/consts';
import { Breadcrumbs, Link } from '@material-ui/core';

function PolicyBreadcrumbs({...props}) {
    return (
        <Breadcrumbs separator="|" aria-label="Policies breadcrumb" {...props}>
            <Link href={LINKS.PrivacyPolicy}>Privacy</Link>
            <Link href={LINKS.Terms}>{'Terms & Conditions'}</Link>
        </Breadcrumbs>
    );
}

PolicyBreadcrumbs.propTypes = {
}

export default PolicyBreadcrumbs;