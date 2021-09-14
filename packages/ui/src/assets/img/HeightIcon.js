import React from 'react';
import PropTypes from 'prop-types';

function HeightIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 492.001 492.001"
            className={props.className}
            aria-labelledby="height-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="height-title">{props.iconTitle ?? 'Grown Height'}</title>
            <path d="M333.807 375.442c-5.408-5.408-13.76-5.408-19.168 0l-49.416 49.864V66.51l49.644 50.096c2.604 2.612 5.876 4.052 9.584 4.052 3.708 0 7.084-1.44 9.7-4.052l7.392-7.448c2.612-2.612 4.02-6.096 4.02-9.812 0-3.712-1.448-7.2-4.06-9.808L255.995 4.042c-2.672-2.676-6.252-4.104-9.924-4.04-3.828-.068-7.412 1.36-10.08 4.036l-85.464 85.464c-5.228 5.224-5.228 14.4 0 19.62l7.444 7.448c5.412 5.404 14.572 5.404 19.968-.004l48.816-48.456v355.984l-49.036-48.692c-5.416-5.408-14.396-5.408-19.804 0l-7.528 7.448c-5.236 5.224-5.276 14.4-.048 19.62l85.468 85.5c2.68 2.668 6.244 4.104 9.916 4.028 3.828.076 7.404-1.356 10.076-4.028l85.46-85.464c5.232-5.224 5.232-14.396 0-19.62l-7.452-7.444z" />
        </svg>
    )
}

HeightIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { HeightIcon };