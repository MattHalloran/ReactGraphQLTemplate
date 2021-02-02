import PropTypes from 'prop-types';

function SaltIcon(props) {
	return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 297.8 297.8" aria-labelledby="title" width={props.width} height={props.height}>
      <title id="title">{props.iconTitle ?? 'Salt'}</title>
      <path d="M243 262c0 4-1 8-3 11-3 3-7 5-11 5H69c-5 0-8-2-11-5-2-3-4-7-3-11L76 93h146l21 169zm-35-16V131a10 10 0 10-20 0v115a10 10 0 0020 0zm-49 0V131a10 10 0 10-20 0v115a10 10 0 0020 0zm-50 0V131a10 10 0 10-20 0v115a10 10 0 0020 0z" fill="#046b90"/>
      <path d="M230 63l-2 10H70l-2-10c0-23 37-43 81-43s81 20 81 43zm-55-23a10 10 0 00-10-10 10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10zm-33 0a10 10 0 00-10-10 10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10z" fill="#80aab8"/>
      <path d="M263 260c1 10-2 19-8 26-7 8-16 12-26 12H69c-10 0-20-4-26-12-6-7-9-16-8-26L56 89c-5-8-8-17-8-26C48 28 92 0 149 0s101 28 101 63c0 9-3 18-9 26l22 171zm-23 13c2-3 3-7 3-11L222 93H76L55 262c-1 4 1 8 3 11 3 3 6 5 11 5h160c4 0 8-2 11-5zM228 73l2-10c0-23-37-43-81-43S68 40 68 63l2 10h158z"/>
      <path d="M208 131v115a10 10 0 11-20 0V131a10 10 0 1120 0zM172 33a10 10 0 010 14 10 10 0 01-14 0c-2-2-3-4-3-7a10 10 0 0110-10c3 0 6 1 7 3zM159 131v115a10 10 0 11-20 0V131a10 10 0 1120 0zM139 33a10 10 0 010 14c-1 2-4 3-7 3s-5-1-7-3-3-4-3-7a10 10 0 0110-10c3 0 6 1 7 3zM109 131v115a10 10 0 11-20 0V131a10 10 0 1120 0z"/>
    </svg>
	)
}

SaltIcon.propTypes = {
  iconTitle: PropTypes.string,
  className: PropTypes.string,
	width: PropTypes.string,
	height: PropTypes.string,
}

export default SaltIcon;