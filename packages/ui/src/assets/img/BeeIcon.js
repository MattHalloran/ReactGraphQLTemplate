import React from 'react';
import PropTypes from 'prop-types';

function BeeIcon(props) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" 
			className={props.className} 
			viewBox="0 0 297.5 297.5" 
			aria-labelledby="title" 
			width={props.width} 
			height={props.height}
			onClick={() => typeof props.onClick === 'function' && props.onClick()}>
		<title id="title">{props.iconTitle ?? 'Bee'}</title>
		<path d="M126 79c15 15 4 50-23 77-17 18-40 29-58 29-8 0-14-2-18-7-15-15-5-50 22-77 18-18 40-29 58-29 8 0 14 2 19 7zM249 101c27 27 37 62 22 77-5 5-11 7-19 7-18 0-40-11-58-29-27-27-37-62-22-77 4-5 11-7 19-7 18 0 40 11 58 29z" 
			fill="#7ac1a3" />
		<path d="M171 56a40 40 0 00-22 22 41 41 0 00-23-22 23 23 0 0145 0zM149 119c2 8 5 16 10 23a61 61 0 01-20 0c4-7 8-15 10-23zM180 170l6 5c-5 9-20 16-37 16s-33-7-37-16a135 135 0 0015-16 79 79 0 0044 0l9 11zM187 201v3a39 39 0 01-77 0v-3c10 6 24 10 39 10s28-4 38-10z"
			fill="#dec978" />
		<path d="M262 87c36 36 46 82 23 105-8 8-20 12-33 12-14 0-30-5-45-13v13c0 29-21 53-48 57v21a10 10 0 11-20 0v-21c-27-4-48-28-48-57v-13c-15 8-31 13-46 13-13 0-24-4-32-12-23-23-14-69 22-105 22-21 49-34 72-34 0-5 1-10 3-14L93 23a10 10 0 1114-14l15 14a42 42 0 0153 0l15-14a10 10 0 0114 14l-16 16h-1l4 14c23 0 50 13 71 34zm9 91c15-15 5-50-22-77-18-18-40-29-58-29-8 0-15 2-19 7-15 15-5 50 22 77 18 18 40 29 58 29 8 0 14-2 19-7zm-84 26v-3c-10 6-23 10-38 10s-29-4-39-10v3a39 39 0 0077 0zm-1-29a148 148 0 01-15-16 79 79 0 01-44 0 145 145 0 01-15 16c4 9 20 16 37 16s32-7 37-16zM171 56a23 23 0 00-45 0 40 40 0 0123 22 41 41 0 0122-22zm-12 86c-5-7-8-15-10-23-2 8-6 16-10 23a61 61 0 0020 0zm-56 14c27-27 38-62 23-77-5-5-11-7-19-7-18 0-40 11-58 29-27 27-37 62-22 77 4 5 10 7 18 7 18 0 41-11 58-29z" />
		</svg>
	)
}

BeeIcon.propTypes = {
	iconTitle: PropTypes.string,
	className: PropTypes.string,
	onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { BeeIcon };
