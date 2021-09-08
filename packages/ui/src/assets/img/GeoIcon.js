import React from 'react';
import PropTypes from 'prop-types';

function GeoIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            className={props.className}
            aria-labelledby="geo-title" 
            width={props.width} 
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="geo-title">{props.iconTitle ?? 'Address'}</title>
            <path d="M12.17 8.94a19.23 19.23 0 01-1.96 3.07A31.5 31.5 0 018 14.58a31.48 31.48 0 01-2.2-2.57c-.73-.95-1.44-2-1.97-3.07A6.92 6.92 0 013 6a5 5 0 0110 0c0 .86-.3 1.87-.83 2.94zM8 16s6-5.69 6-10A6 6 0 002 6c0 4.31 6 10 6 10z"/>
            <path d="M8 8a2 2 0 110-4 2 2 0 010 4zm0 1a3 3 0 100-6 3 3 0 000 6z"/>
        </svg>
	)
}

GeoIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { GeoIcon };
