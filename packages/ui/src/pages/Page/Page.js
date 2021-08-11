import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LINKS, PUBS, PubSub } from 'utils';
import { loginMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';

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

    useEffect(() => {
        login().then((response) => {
            onSessionUpdate(response.data.login);
            setSessionChecked(true);
        }).catch((response) => { 
            PubSub.publish(PUBS.Snack, { message: 'Error: Cannot connect to server', severity: 'error', data: response }) 
        })
    }, [login, onSessionUpdate])

    useEffect(() => {
        document.title = title || "";
    }, [title]);

    // If this page has restricted access
    if (restrictedToRoles) {
        if (!userRoles) return null;
        const haveArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        const needArray = Array.isArray(restrictedToRoles) ? restrictedToRoles : [restrictedToRoles];
        const valid_role = haveArray.some(r => needArray.includes(r?.role?.title));
        return valid_role ? children : null;
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