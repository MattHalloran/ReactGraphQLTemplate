import React from 'react';
import PropTypes from 'prop-types';

function FullscreenIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className={props.className}
            aria-labelledby="fullscreen-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="fullscreen-title">{props.iconTitle ?? 'Expand'}</title>
            <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
        </svg>
	)
}

FullscreenIcon.propTypes = {
	iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { FullscreenIcon };
