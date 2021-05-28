import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { LINKS } from 'utils';

const Page = ({
    title,
    sessionFailed = false,
    redirect = LINKS.Home,
    onRedirect,
    roles,
    authRole = null,
    children
}) => {

    console.log('RENDERING PAGE')
    console.log(sessionFailed, roles, authRole)

    useEffect(() => {
        document.title = title || "";
    }, [title]);

    // If this page has restricted access
    if (authRole !== null) {
        let role_titles = roles?.map(r => r.title);
        const valid_role = (role_titles?.indexOf(authRole) >= 0);
        if (!valid_role && sessionFailed) onRedirect(redirect);
        return valid_role ? children : null;
    }

    return children;
};

Page.propTypes = {
    title: PropTypes.string,
    sessionFailed: PropTypes.bool,
    redirect: PropTypes.string,
    roles: PropTypes.array,
    authRole: PropTypes.string,
    children: PropTypes.object.isRequired,
}

export { Page };