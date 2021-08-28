import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { LINKS } from 'utils';
import { useLocation } from 'react-router-dom';

const Page = ({
    title,
    sessionChecked,
    redirect = LINKS.Home,
    onRedirect,
    userRoles,
    restrictedToRoles,
    children
}) => {
    const location = useLocation();

    useEffect(() => {
        document.title = title || "";
    }, [title]);

    // If this page has restricted access
    if (restrictedToRoles) {
        if (Array.isArray(userRoles)) {
            const haveArray = Array.isArray(userRoles) ? userRoles : [userRoles];
            const needArray = Array.isArray(restrictedToRoles) ? restrictedToRoles : [restrictedToRoles];
            if (haveArray.some(r => needArray.includes(r?.role?.title))) return children;
        }
        if (sessionChecked && location.pathname !== redirect) onRedirect(redirect);
        return null;
    }

    return children;
};

Page.propTypes = {
    title: PropTypes.string,
    sessionChecked: PropTypes.bool.isRequired,
    redirect: PropTypes.string,
    userRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    restrictedToRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    children: PropTypes.object.isRequired,
}

export { Page };