import PropTypes from 'prop-types';

function PersonPlusIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Sign Up/Log In'}</title>
            <path d="M6 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1 0c0-.2-.2-1-.8-1.7-.7-.6-2-1.3-4.2-1.3-2.3 0-3.5.7-4.2 1.3-.6.7-.8 1.4-.8 1.7h10z"/>
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 01.5.5V7h1.5a.5.5 0 010 1H14v1.5a.5.5 0 01-1 0V8h-1.5a.5.5 0 010-1H13V5.5a.5.5 0 01.5-.5z"/>
        </svg>
    )
}

PersonPlusIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export default PersonPlusIcon;