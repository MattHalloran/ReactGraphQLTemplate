import { useLayoutEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { checkCookies } from 'query/http_promises';
import { LINKS, USER_ROLES, LOCAL_STORAGE } from 'utils/consts';
import { getItem } from 'utils/storage';

function RequireAuthentication({
    session,
    role = USER_ROLES.Customer,
    children
}) {

    const history = useHistory();
    const user_roles = getItem(LOCAL_STORAGE.Roles);
    console.log('USER ROLES IN REQUIRE AUTHHH', user_roles, session)

    let role_titles = user_roles?.map(r => r.title);
    const valid_role = (role_titles?.indexOf(role) >= 0);

    useLayoutEffect(() => {
        if (!valid_role) {
            history.push(LINKS.Home);
        // As an extra check, make sure the user's cookies are vlid
        } else {
            checkCookies().then().catch((err) => {
                console.log('FAILED COOKIE CHECK', err)
                history.push(LINKS.Home);
            })
        }
    },[])

    return valid_role ? children : null;
}

RequireAuthentication.propTypes = {
    session: PropTypes.object,
    role: PropTypes.string.isRequired,
    children: PropTypes.any
}

export default RequireAuthentication;