import React, { useEffect } from 'react';
import { LINKS } from 'utils';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';

interface Props {
    title?: string;
    sessionChecked: boolean;
    redirect?: string;
    userRoles: Role | Role[];
    restrictedToRoles: string[];
    children: React.FC;
}

const Page: React.FC<Props> = ({
    title = '',
    sessionChecked,
    redirect = LINKS.Home,
    userRoles,
    restrictedToRoles,
    children
}) => {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        document.title = title;
    }, [title]);

    // If this page has restricted access
    if (restrictedToRoles) {
        if (Array.isArray(userRoles)) {
            const haveArray = Array.isArray(userRoles) ? userRoles : [userRoles];
            const needArray = Array.isArray(restrictedToRoles) ? restrictedToRoles : [restrictedToRoles];
            if (haveArray.some(r => needArray.includes(r?.role?.title))) return children;
        }
        if (sessionChecked && location.pathname !== redirect) history.replace(redirect);
        return null;
    }

    return children;
};

export { Page };