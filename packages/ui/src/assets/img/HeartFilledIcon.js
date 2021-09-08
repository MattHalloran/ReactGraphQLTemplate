import React from 'react';
import PropTypes from 'prop-types';

function HeartFilledIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16" 
            className={props.className}
            aria-labelledby="heartfilled-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="heartfilled-title">{props.iconTitle ?? 'Unlike'}</title>
            <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
        </svg>
	)
}

HeartFilledIcon.propTypes = {
	iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { HeartFilledIcon };
