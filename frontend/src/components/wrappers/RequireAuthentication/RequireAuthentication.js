import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LINKS, USER_ROLES, } from 'utils/consts';
import { getRoles, } from 'utils/storage';

function RequireAuthentication({
    role = USER_ROLES.Customer,
    children,
}) {
    const history = useHistory();
    const user_roles = getRoles();

    let role_titles = user_roles?.map(r => r.title);
    const valid_role = (role_titles?.indexOf(role) >= 0);
    if (!valid_role) history.push(LINKS.Home);
    return valid_role ? children : null;
}

RequireAuthentication.propTypes = {
    role: PropTypes.string.isRequired,
    children: PropTypes.any
}

export default RequireAuthentication;