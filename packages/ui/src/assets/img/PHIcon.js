import PropTypes from 'prop-types';

function PHIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Soil PH'}</title>
            <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="175.422" x2="336.578" y1="256.497" y2="95.341">
                <stop offset="0" stopColor="#b3e152" />
                <stop offset="1" stopColor="#f6e46f" />
            </linearGradient>
            <path d="M490.668 256c0 129.602-105.066 234.668-234.668 234.668S21.332 385.602 21.332 256 126.398 21.332 256 21.332 490.668 126.398 490.668 256zm0 0" fill="#f5fbe9" />
            <path d="M320 469.332c-129.602 0-234.668-105.062-234.668-234.664 0-91.68 52.578-171.066 129.223-209.684C104.719 44.554 21.332 140.54 21.332 256c0 129.602 105.066 234.668 234.668 234.668 37.926 0 73.742-9.008 105.445-24.984A236.38 236.38 0 01320 469.332zm0 0" fill="#ecf7d4" />
            <path d="M256 512C114.84 512 0 397.16 0 256S114.84 0 256 0s256 114.84 256 256-114.84 256-256 256zm0-469.332c-117.633 0-213.332 95.7-213.332 213.332S138.368 469.332 256 469.332 469.332 373.632 469.332 256 373.632 42.668 256 42.668zm0 0" fill="#c6e87d" />
            <path d="M192 405.332h-42.668v-128c0-11.781 9.555-21.332 21.336-21.332h64c11.781 0 21.332 9.55 21.332 21.332v64c0 11.781-9.55 21.336-21.332 21.336H192zM192 320h21.332v-21.332H192zm0 0M341.332 256v64H320v-64h-42.668v149.332H320v-42.664h21.332v42.664H384V256zm0 0" fill="#b3e152" />
            <path d="M256 85.332c-65.55 0-126.09 38.277-154.23 97.512l38.539 18.304C161.418 156.715 206.832 128 256 128s94.582 28.715 115.691 73.152l38.54-18.308C382.09 123.609 321.55 85.332 256 85.332zm0 0" fill="url(#a)" />
            <path d="M152.926 97.172l35.504-23.668 85.332 128.008-35.5 23.668zm0 0" fill="#a0d927" />
        </svg>
    )
}

PHIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { PHIcon };