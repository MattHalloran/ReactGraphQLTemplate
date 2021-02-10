import PropTypes from 'prop-types';

function PhoneIcon(props) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			className={props.className}
			aria-labelledby="title"
			width={props.width}
			height={props.height}
			onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Call'}</title>
            <path d="M3.65 1.33a.68.68 0 00-1.01-.07L1.6 2.3a1.72 1.72 0 00-.45 1.77 17.57 17.57 0 004.17 6.6 17.57 17.57 0 006.61 4.18c.6.2 1.29.03 1.77-.45l1.04-1.04a.68.68 0 00-.07-1.01l-2.3-1.8a.68.68 0 00-.58-.12l-2.2.55a1.75 1.75 0 01-1.65-.46L5.48 8.06a1.75 1.75 0 01-.46-1.66l.55-2.19a.68.68 0 00-.12-.58l-1.8-2.3zM1.88.5A1.75 1.75 0 014.5.67l1.79 2.31c.33.42.45.97.32 1.5l-.55 2.18a.68.68 0 00.18.65l2.45 2.45a.68.68 0 00.65.18l2.19-.54a1.75 1.75 0 011.49.31l2.3 1.8c.84.64.91 1.86.17 2.6l-1.03 1.04a2.78 2.78 0 01-2.88.7 18.63 18.63 0 01-7.01-4.42 18.63 18.63 0 01-4.42-7 2.78 2.78 0 01.7-2.88L1.88.5z"/>
        </svg>
	)
}

PhoneIcon.propTypes = {
	iconTitle: PropTypes.string,
	className: PropTypes.string,
	onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default PhoneIcon;