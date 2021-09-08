import React from 'react';
import PropTypes from 'prop-types';

function NoWaterIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={props.className}
            aria-labelledby="nowater-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="nowater-title">{props.iconTitle ?? 'Drought Tolerance'}</title>
            <path d="M256 414c-68 0-123-55-123-123v-5c0-26 8-51 24-72l99-137 99 137c16 21 24 46 24 72v5c0 68-55 123-123 123z" fill="#87daff" />
            <path d="M355 214L256 77v337c68 0 123-55 123-123v-5c0-26-8-51-24-72z" fill="#00c3ff" />
            <path d="M256 129l-75 103a92 92 0 00-18 54v5a93 93 0 00186 0v-5c0-20-6-39-18-54l-75-103z" fill="#a5e9ff" />
            <path d="M331 232l-75-103v255c51 0 93-42 93-93v-5c0-20-6-39-18-54z" fill="#87daff" />
            <path d="M437 75a254 254 0 00-362 0 254 254 0 000 362 254 254 0 00362 0 254 254 0 000-362zM256 30c57 0 109 21 149 56L86 405A226 226 0 01256 30zm0 452c-57 0-109-21-149-56l319-319a226 226 0 01-170 375z" fill="#ff6849" />
            <path d="M437 75C389 27 324 0 256 0v30c57 0 109 21 149 56L256 235v42l170-170a226 226 0 01-170 375v30a254 254 0 00256-256c0-68-27-133-75-181z" fill="#e8130f" />
        </svg>
    )
}

NoWaterIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { NoWaterIcon };
