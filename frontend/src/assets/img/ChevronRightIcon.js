import PropTypes from 'prop-types';

function ChevronRightIcon(props) {
	return (
        <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewport="0 0 16 16" aria-labelledby="title" width={props.width} height={props.height}>
            <title id="title">{props.iconTitle ?? 'Next'}</title>
            <path fill-rule="evenodd" d="M4.6 1.6a.5.5 0 01.8 0l6 6a.5.5 0 010 .8l-6 6a.5.5 0 01-.8-.8L10.3 8 4.6 2.4a.5.5 0 010-.8z"/>
        </svg>
	)
}

ChevronRightIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default ChevronRightIcon;