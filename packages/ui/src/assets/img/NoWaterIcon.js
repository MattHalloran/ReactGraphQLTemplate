import React from 'react';
import PropTypes from 'prop-types';

function NoWaterIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 197.139 197.139"
            className={props.className}
            aria-labelledby="nowater-title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="nowater-title">{props.iconTitle ?? 'Drought Tolerance'}</title>
            <path d="M188.317 15.447c-2.929-2.929-7.678-2.929-10.606 0l-33.815 33.815c-13.219-22.731-26.321-41.91-29.164-46.025C113.331 1.21 111.024 0 108.56 0c-2.464 0-4.771 1.21-6.171 3.238C96.27 12.1 42.601 90.786 42.601 124.435c0 7.805 1.371 15.294 3.872 22.248L8.822 184.335c-2.929 2.929-2.929 7.678 0 10.607 1.464 1.464 3.384 2.197 5.303 2.197s3.839-.732 5.303-2.197L53.57 160.8c11.822 17.815 32.053 29.59 54.991 29.59 36.379 0 65.977-29.587 65.977-65.955 0-14.985-10.647-38.9-22.999-61.604l36.778-36.778c2.929-2.928 2.929-7.678 0-10.606zM57.601 124.435c0-21.813 32.555-75.641 50.96-103.518 6.925 10.483 15.853 24.639 24.296 39.381l-74.246 74.246c-.659-3.268-1.01-6.648-1.01-10.109zm101.936 0c0 28.097-22.868 50.955-50.977 50.955-18.82 0-35.278-10.263-44.104-25.478L140.42 73.95c10.695 20.022 19.117 39.389 19.117 50.485z"/>
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