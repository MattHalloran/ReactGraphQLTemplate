import React from 'react';
import PropTypes from 'prop-types';
import { 
    Breadcrumbs, 
    Link 
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';

// Breadcrumbs reload all components if using href directly. Not sure why
function BreadcrumbsBase({
    paths,
    separator = '|',
    ariaLabel = 'breadcrumb',
    ...props
}) {
    const history = useHistory();
    return (
            <Breadcrumbs separator={separator} aria-label={ariaLabel} {...props}>
                {paths.map(p => (
                    <Link 
                        key={p[0]}
                        onClick={() => history.push(p[1])}
                    >
                        {window.location.pathname === p[1] ? <b>{p[0]}</b> : p[0]}
                    </Link>
                ))}
            </Breadcrumbs>
    );
}

BreadcrumbsBase.propTypes = {
    paths: PropTypes.array.isRequired,
    separator: PropTypes.string,
    ariaLabel: PropTypes.string,
}

export { BreadcrumbsBase };