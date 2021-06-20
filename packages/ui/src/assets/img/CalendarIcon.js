import PropTypes from 'prop-types';

function CalendarIcon(props) {
	return (
            <svg viewBox="0 0 299.1 299.1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={props.className} 
                  aria-labelledby="title" 
                  width={props.width} 
                  height={props.height}
                  onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Calendar'}</title>
            <path d="M258 27H41C22 27 6 43 6 62v202c0 19 16 35 35 35h217c20 0 35-16 35-35V62c0-19-15-35-35-35z" 
                  fill="#ebf0f3"/>
            <path d="M293 92V50c0-19-15-35-35-35H41C22 15 6 31 6 50v42z"
                  fill="#ce412d"/>
            <path d="M293 100V62c0-19-15-35-35-35H41C22 27 6 43 6 62v38z"
                  fill="#e56353"/>
            <path d="M63 46a12 12 0 100 24 12 12 0 000-24z"
                  fill="#d15241"/>
            <path d="M63 0c-4 0-7 3-7 6v51a6 6 0 1013 0V6c0-3-3-6-6-6z"
                  fill="#4d5c7d"/>
            <path d="M121 46a12 12 0 100 24 12 12 0 000-24z"
                  fill="#d15241"/>
            <path d="M121 0c-4 0-7 3-7 6v51a6 6 0 1013 0V6c0-3-3-6-6-6z"
                  fill="#4d5c7d"/>
            <path d="M178 46a12 12 0 100 24 12 12 0 000-24z"
                  fill="#d15241"/>
            <path d="M178 0c-3 0-6 3-6 6v51a6 6 0 1013 0V6c0-3-3-6-7-6z"
                  fill="#4d5c7d"/>
            <path d="M236 46a12 12 0 100 24 12 12 0 000-24z"
                  fill="#d15241"/>
            <path d="M236 0c-3 0-6 3-6 6v51a6 6 0 1013 0V6c0-3-3-6-7-6z"
                  fill="#4d5c7d"/>
            <g fill="#e56353">
                <path d="M112 148h26v26h-26zM161 148h26v26h-26zM210 148h26v26h-26zM63 189h26v27H63zM112 189h26v27h-26zM161 189h26v27h-26zM210 189h26v27h-26zM63 230h26v27H63zM112 230h26v27h-26zM161 230h26v27h-26z"/>
            </g>
        </svg>
	)
}

CalendarIcon.propTypes = {
      iconTitle: PropTypes.string,
      className: PropTypes.string,
      onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { CalendarIcon };

