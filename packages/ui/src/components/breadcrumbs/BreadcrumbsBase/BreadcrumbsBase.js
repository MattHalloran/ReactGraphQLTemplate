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
    textColor = 'textPrimary',
    style,
    ...props
}) {
    const history = useHistory();
    // Match separator color to link color, if not specified
    let updatedStyle = style ?? {};
    if (textColor && !updatedStyle.color) updatedStyle.color = textColor;
    updatedStyle.cursor = 'pointer';
    return (
            <Breadcrumbs separator={separator} aria-label={ariaLabel} style={updatedStyle} {...props}>
                {paths.map(p => (
                    <Link 
                        key={p[0]}
                        color={textColor}
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
    textColor: PropTypes.string,
}

export { BreadcrumbsBase };