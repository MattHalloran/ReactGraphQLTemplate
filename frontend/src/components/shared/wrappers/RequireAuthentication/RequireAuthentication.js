import { useLayoutEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { checkCookies } from 'query/http_promises';
import { LINKS } from 'consts';

function RequireAuthentication(props) {
    let history = useHistory();

    useLayoutEffect(() => {
        if (props.session) return;
        checkCookies().then().catch(() => {
            history.push(LINKS.Home);
        })
    })

    if (props.session) return props.children;
    return null;
}

RequireAuthentication.propTypes = {
    session: PropTypes.object,
}

export default RequireAuthentication;