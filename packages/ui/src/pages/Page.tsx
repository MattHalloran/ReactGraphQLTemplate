import { useEffect } from 'react';
import { LINKS } from 'utils';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Role } from '@local/shared';

interface Props {
    title?: string;
    sessionChecked: boolean;
    redirect?: string;
    userRoles: Role[];
    restrictedToRoles?: string[];
    children: JSX.Element;
}

export const Page = ({
    title = '',
    sessionChecked,
    redirect = LINKS.Home,
    userRoles,
    restrictedToRoles = [],
    children
}: Props) => {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        document.title = title;
    }, [title]);

    // If this page has restricted access
    if (restrictedToRoles) {
        if (Array.isArray(userRoles)) {
            if (userRoles.some(r => restrictedToRoles.includes(r?.title))) return children;
        }
        if (sessionChecked && location.pathname !== redirect) history.replace(redirect);
        return null;
    }

    return children;
};