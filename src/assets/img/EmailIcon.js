import PropTypes from 'prop-types';

function EmailIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            className={props.className}
            aria-labelledby="title" 
            width={props.width} 
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Email Us'}</title>
            <path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v.2l7 4.2 7-4.2V4a1 1 0 00-1-1H2zm13 2.4l-4.8 2.8 4.8 3V5.3zm0 6.9L9.3 8.8 8 9.6l-1.3-.8L1 12.3a1 1 0 001 .7h12a1 1 0 001-.7zM1 11l4.8-2.9L1 5.4V11z"/>
        </svg>
	)
}

EmailIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default EmailIcon;