import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LINKS } from 'utils';
import { loginMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { useLocation } from 'react-router-dom';

const Page = ({
    title,
    onSessionUpdate,
    redirect = LINKS.Home,
    onRedirect,
    userRoles,
    restrictedToRoles,
    children
}) => {
    const [sessionChecked, setSessionChecked] = useState(false);
    const [login] = useMutation(loginMutation);
    const location = useLocation();

    useEffect(() => {
        login().then((response) => {
            onSessionUpdate(response.data.login);
            setSessionChecked(true);
        }).catch((response) => { 
            if (process.env.NODE_ENV === 'development') console.error('Error: cannot login', response);
            setSessionChecked(true);
        })
    }, [login, onSessionUpdate])

    useEffect(() => {
        document.title = title || "";
    }, [title]);

    // If this page has restricted access
    if (restrictedToRoles) {
        if (userRoles) {
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
    onSessionUpdate: PropTypes.func.isRequired,
    redirect: PropTypes.string,
    userRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    restrictedToRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    children: PropTypes.object.isRequired,
}

export { Page };