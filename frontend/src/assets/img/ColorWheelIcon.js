import PropTypes from 'prop-types';

function ColorWheelIcon(props) {
	return (
        <svg viewBox="0 0 64 64" 
            xmlns="http://www.w3.org/2000/svg"
            className={props.className} 
            aria-labelledby="title" 
            width={props.width} 
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Color Wheel'}</title>
            <path d="M63 32H53c0-5.801-2.35-11.051-6.15-14.851l7.07-7.069C59.53 15.689 63 23.439 63 32z" fill="#f6bb42"/>
            <path d="M53 32h10c0 8.55-3.46 16.3-9.08 21.909l-7.07-7.06C50.65 43.05 53 37.8 53 32z" fill="#8cc152"/>
            <path d="M53.92 53.909v.011C48.31 59.529 40.57 63 32 63V53c5.8 0 11.05-2.351 14.85-6.15z" fill="#37bc9b"/>
            <path d="M53.92 10.08l-7.07 7.069C43.05 13.35 37.8 11 32 11V1c8.57 0 16.31 3.47 21.92 9.08z" fill="#e9573f"/>
            <path d="M53 32H43c0-3.04-1.23-5.79-3.22-7.78l7.069-7.07C50.65 20.949 53 26.199 53 32z" fill="#ffce54"/>
            <path d="M39.78 39.779l7.069 7.07C43.05 50.649 37.8 53 32 53V43c3.04 0 5.79-1.23 7.78-3.221z" fill="#48cfad"/>
            <path d="M32 53v10c-8.56 0-16.31-3.471-21.92-9.08l7.07-7.07C20.95 50.649 26.21 53 32 53z" fill="#4a89dc"/>
            <path d="M32 43v10c-5.79 0-11.05-2.351-14.85-6.15l7.069-7.07C26.21 41.77 28.97 43 32 43z" fill="#5d9cec"/>
            <path d="M32 11v10c-3.03 0-5.78 1.229-7.77 3.22h-.01l-7.069-7.07C20.95 13.35 26.21 11 32 11z" fill="#ed5565"/>
            <path d="M17.15 46.85l-7.07 7.07C4.47 48.31 1 40.56 1 32h10c0 5.8 2.35 11.05 6.15 14.85z" fill="#967adc"/>
            <path d="M43.01 32H53c0 5.8-2.35 11.05-6.15 14.85l-7.069-7.07C41.77 37.79 43 35.029 43 32z" fill="#a0d468"/>
            <path d="M17.15 17.149l7.069 7.07C22.23 26.21 21 28.96 21 32H11c0-5.801 2.35-11.051 6.15-14.851z" fill="#ec87c0"/>
            <path d="M24.22 39.779l-7.069 7.07C13.35 43.05 11 37.8 11 32h10c0 3.029 1.23 5.79 3.22 7.779z" fill="#ac92ec"/>
            <path d="M10.08 10.08l7.07 7.069C13.35 20.949 11 26.199 11 32H1c0-8.561 3.47-16.311 9.08-21.92z" fill="#d770ad"/>
            <path d="M46.85 17.149l-7.069 7.07C37.79 22.229 35.04 21 32 21V11c5.8 0 11.05 2.35 14.85 6.149z" fill="#fc6e51"/>
            <path d="M32 1v10c-5.79 0-11.05 2.35-14.85 6.149l-7.07-7.069C15.69 4.47 23.44 1 32 1z" fill="#da4453"/>
        </svg>
	)
}

ColorWheelIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default ColorWheelIcon;