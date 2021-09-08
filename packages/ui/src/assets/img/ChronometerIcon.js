import React from 'react';
import PropTypes from 'prop-types';

function ChronometerIcon(props) {
	return (
            <svg xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 512 512" 
                  className={props.className} 
                  aria-labelledby="chronometer-title" 
                  width={props.width} 
                  height={props.height}
                  onClick={() => typeof props.onClick === 'function' && props.onClick()}>
                  <title id="chronometer-title">{props.iconTitle ?? 'Chronometer'}</title>
                  <path d="M150 102l-30-30a36 36 0 00-52 0L46 93a37 37 0 000 52l30 30a15 15 0 0022 0l52-52c6-6 6-16 0-21z" fill="#105c6e"/>
                  <path d="M256 3c-8 0-15 7-15 15v48a15 15 0 0030 0V18c0-8-7-15-15-15z" fill="#26879c"/>
                  <path d="M293 0h-74a15 15 0 000 30h74a15 15 0 000-30z" fill="#de513c"/>
                  <path d="M256 0h-37a15 15 0 000 30h37V0z" fill="#fc6249"/>
                  <path d="M419 119a228 228 0 00-326 0 229 229 0 000 325 228 228 0 00326 0 229 229 0 000-325z" fill="#de513c"/>
                  <path d="M256 51A229 229 0 0093 444c44 44 102 68 163 68V51z" fill="#fc6249"/>
                  <path d="M256 109a173 173 0 101 346 173 173 0 00-1-346z" fill="#96d1d9"/>
                  <path d="M256 109a173 173 0 000 346V109z" fill="#f4f2e6"/>
                  <g fill="#105c6e">
                        <path d="M256 146c8 0 15-7 15-15v-22a174 174 0 00-30 0v22c0 8 7 15 15 15zM256 417c-8 0-15 7-15 15v22a174 174 0 0030 0v-22c0-8-7-15-15-15zM428 267h-21a15 15 0 000 30h21a175 175 0 000-30zM120 282c0-9-6-15-15-15H84a175 175 0 000 30h21c9 0 15-7 15-15zM293 273h-21v-61a15 15 0 00-30 0v76c0 8 7 15 15 15h36a15 15 0 000-30z"/>
                  </g>
            </svg>
	)
}

ChronometerIcon.propTypes = {
      iconTitle: PropTypes.string,
      className: PropTypes.string,
      onClick: PropTypes.func,
	width: PropTypes.string,
	height: PropTypes.string,
}

export { ChronometerIcon };
