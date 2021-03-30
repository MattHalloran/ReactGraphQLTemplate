import { LINKS } from 'utils/consts';
import { Breadcrumbs, Link } from '@material-ui/core';

function PolicyBreadcrumbs() {
    return (
        <Breadcrumbs separator="|" aria-label="Policies breadcrumb">
            <Link href={LINKS.PrivacyPolicy}>Privacy</Link>
            <Link href={LINKS.Terms}>{'Terms & Conditions'}</Link>
        </Breadcrumbs>
    );
}

PolicyBreadcrumbs.propTypes = {
}

export default PolicyBreadcrumbs;