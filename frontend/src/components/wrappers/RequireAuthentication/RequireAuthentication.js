import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LINKS, USER_ROLES, } from 'utils/consts';

function RequireAuthentication({
    roles,
    role = USER_ROLES.Customer,
    children,
}) {
    const history = useHistory();

    let role_titles = roles?.map(r => r.title);
    const valid_role = (role_titles?.indexOf(role) >= 0);
    if (!valid_role) history.push(LINKS.Home);
    return valid_role ? children : null;
}

RequireAuthentication.propTypes = {
    roles: PropTypes.array,
    role: PropTypes.string.isRequired,
    children: PropTypes.any
}

export default RequireAuthentication;