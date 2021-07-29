import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LINKS } from 'utils';
import { loginMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { CUSTOMER_ROLES } from '@local/shared';

const Page = ({
    title,
    onSessionUpdate,
    redirect = LINKS.Home,
    onRedirect,
    roles,
    authRole = null,
    children
}) => {
    const [sessionChecked, setSessionChecked] = useState(false);
    const [login] = useMutation(loginMutation);

    useEffect(() => {
        console.log('LOGGING INNNNN.......')
        login().then((response) => {
            onSessionUpdate(response.data.login);
            setSessionChecked(true);
        }).catch((response) => {console.error(response); setSessionChecked(true)})
    }, [login, onSessionUpdate])

    useEffect(() => {
        document.title = title || "";
    }, [title]);

    // If this page has restricted access
    if (authRole !== null) {
        let role_titles = roles?.map(r => r.title);
        const valid_role = (role_titles?.indexOf(authRole) >= 0) || 
                           (role_titles?.indexOf(CUSTOMER_ROLES.Admin) >= 0);
        if (!valid_role && sessionChecked) onRedirect(redirect);
        return valid_role ? children : null;
    }

    return children;
};

Page.propTypes = {
    title: PropTypes.string,
    onSessionUpdate: PropTypes.func.isRequired,
    redirect: PropTypes.string,
    roles: PropTypes.array,
    authRole: PropTypes.string,
    children: PropTypes.object.isRequired,
}

export { Page };