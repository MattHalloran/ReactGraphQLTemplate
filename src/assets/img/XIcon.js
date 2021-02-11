import PropTypes from 'prop-types';

function XIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="4 4 8 8"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Close'}</title>
            <path d="M4.65 4.65a.5.5 0 01.7 0L8 7.29l2.65-2.64a.5.5 0 01.7.7L8.71 8l2.64 2.65a.5.5 0 01-.7.7L8 8.71l-2.65 2.64a.5.5 0 01-.7-.7L7.29 8 4.65 5.35a.5.5 0 010-.7z"/>
        </svg>
	)
}

XIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default XIcon;