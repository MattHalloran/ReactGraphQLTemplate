import React from 'react';
import PropTypes from 'prop-types';

function ChevronLeftIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg" 
            className={props.className} 
            aria-labelledby="chevronleft-title" 
            width={props.width} 
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="chevronleft-title">{props.iconTitle ?? 'Previous'}</title>
            <path d="M11.4 1.6a.5.5 0 010 .8L5.7 8l5.7 5.6a.5.5 0 01-.8.8l-6-6a.5.5 0 010-.8l6-6a.5.5 0 01.8 0z"/>
        </svg>
	)
}

ChevronLeftIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { ChevronLeftIcon };
