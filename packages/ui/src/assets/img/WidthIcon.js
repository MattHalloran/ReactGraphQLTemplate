import React from 'react';
import PropTypes from 'prop-types';

function WidthIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 492.001 492.001"
            className={props.className}
            aria-labelledby="width-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="width-title">{props.iconTitle ?? 'Grown Width'}</title>
            <path d="M116.55925 333.80631c5.408-5.408 5.408-13.76 0-19.168l-49.864-49.416h358.796l-50.096 49.644c-2.612 2.604-4.052 5.876-4.052 9.584 0 3.708 1.44 7.084 4.052 9.7l7.448 7.392c2.612 2.612 6.096 4.02 9.812 4.02 3.712 0 7.2-1.448 9.808-4.06l85.496-85.508c2.676-2.672 4.104-6.252 4.04-9.924.068-3.828-1.36-7.412-4.036-10.08l-85.464-85.464c-5.224-5.228-14.4-5.228-19.62 0l-7.448 7.444c-5.404 5.412-5.404 14.572.004 19.968l48.456 48.816h-355.984l48.692-49.036c5.408-5.416 5.408-14.396 0-19.804l-7.448-7.528c-5.224-5.236-14.4-5.276-19.62-.048l-85.5 85.468c-2.668 2.68-4.104 6.244-4.028 9.916-.076 3.828 1.356 7.404 4.028 10.076l85.464 85.46c5.224 5.232 14.396 5.232 19.62 0z"/>
        </svg>
    )
}

WidthIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { WidthIcon };