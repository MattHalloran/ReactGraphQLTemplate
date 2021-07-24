import React from 'react';
import PropTypes from 'prop-types';

function SunIcon(props) {
	return (
    <svg viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg" 
      className={props.className}
      aria-labelledby="title"
      width={props.width}
      height={props.height}
      onClick={() => typeof props.onClick === 'function' && props.onClick()}>
      <title id="title">{props.iconTitle ?? 'Sun'}</title>
      <circle cx="64" cy="64" fill="#fedb41" r="39.2"/>
      <g fill="#fea832">
        <path d="M95.2 65.7a1.7 1.7 0 01-1.7-1.7A29.5 29.5 0 0064 34.5a1.8 1.8 0 010-3.5 33 33 0 0133 33 1.7 1.7 0 01-1.8 1.7zM64 16.8a47.3 47.3 0 018.5.7V16C72.6 8 64 1.7 64 1.7S55.4 8.1 55.4 16l.1 1.6a47.2 47.2 0 018.5-.8zM64 111.2a47.3 47.3 0 008.5-.7v1.6c0 7.8-8.5 14.1-8.5 14.1s-8.6-6.3-8.6-14l.1-1.7a47.3 47.3 0 008.5.7zM97.4 30.6A47.3 47.3 0 01103 37l1.2-1c5.5-5.6 4-16.1 4-16.1S97.4 18.4 92 24L90.8 25a47.3 47.3 0 016.6 5.5zM30.6 97.4a47.2 47.2 0 006.6 5.5L36 104c-5.5 5.5-16 4-16 4S18.4 97.4 24 92l1.1-1.2a47.3 47.3 0 005.5 6.6zM111.2 64a47.3 47.3 0 01-.7 8.5h1.6c7.8 0 14.2-8.5 14.2-8.5s-6.4-8.6-14.2-8.6l-1.6.1a47.3 47.3 0 01.7 8.5zM16.8 64a47.3 47.3 0 00.7 8.5H16C8 72.6 1.8 64 1.8 64s6.3-8.6 14-8.6l1.7.1a47.3 47.3 0 00-.7 8.5zM97.4 97.4a47.3 47.3 0 01-6.6 5.5L92 104c5.5 5.5 16 4 16 4s1.6-10.6-4-16.1l-1.1-1.2a47.3 47.3 0 01-5.5 6.6zM30.6 30.6A47.3 47.3 0 0025 37l-1.2-1C18.4 30.4 20 20 20 20s10.6-1.6 16.1 4l1.2 1.1a47.3 47.3 0 00-6.6 5.5z"/>
      </g>
    </svg>
	)
}

SunIcon.propTypes = {
  iconTitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { SunIcon };
