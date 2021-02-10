import PropTypes from 'prop-types';

function GearIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Admin'}</title>
            <path d="M8 4.75a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5zM5.75 8a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z"/>
            <path d="M9.8 1.34c-.53-1.79-3.07-1.79-3.6 0l-.09.32a.87.87 0 01-1.26.52l-.29-.16c-1.64-.89-3.43.9-2.54 2.54l.16.3a.87.87 0 01-.52 1.25l-.32.1c-1.79.52-1.79 3.06 0 3.59l.32.09a.87.87 0 01.52 1.25l-.16.3c-.89 1.64.9 3.43 2.54 2.54l.3-.16a.87.87 0 011.25.52l.1.32c.52 1.79 3.06 1.79 3.59 0l.09-.32a.87.87 0 011.25-.52l.3.16c1.64.9 3.43-.9 2.54-2.54l-.16-.3a.87.87 0 01.52-1.25l.32-.1c1.79-.52 1.79-3.06 0-3.59l-.32-.09a.87.87 0 01-.52-1.25l.16-.3c.9-1.64-.9-3.43-2.54-2.54l-.3.16a.87.87 0 01-1.25-.52l-.1-.32zm-2.64.29a.87.87 0 011.68 0l.1.32a1.87 1.87 0 002.68 1.11l.3-.16c.76-.42 1.6.42 1.18 1.18l-.16.3a1.87 1.87 0 001.12 2.69l.31.1a.87.87 0 010 1.67l-.32.1a1.87 1.87 0 00-1.11 2.68l.16.3c.41.76-.42 1.6-1.19 1.18l-.29-.16a1.87 1.87 0 00-2.69 1.12l-.1.31a.87.87 0 01-1.67 0l-.1-.32a1.87 1.87 0 00-2.68-1.11l-.3.16c-.76.41-1.6-.42-1.18-1.19l.16-.29a1.87 1.87 0 00-1.11-2.69l-.32-.1a.87.87 0 010-1.67l.32-.1a1.87 1.87 0 001.11-2.68l-.16-.3c-.41-.76.42-1.6 1.19-1.18l.29.16a1.87 1.87 0 002.69-1.12l.1-.31z"/>
        </svg>
	)
}

GearIcon.propTypes = {
	iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default GearIcon;