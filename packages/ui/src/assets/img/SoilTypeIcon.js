import PropTypes from 'prop-types';

function SoilTypeIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Soil Type'}</title>
            <path d="M488 24v464H24V32l24-8 40 24 64-24h32l48 24 48-24h32l48 16 32-16 32 16z" fill="#db8638" />
            <path d="M488 152v336H24V144h24l24 24 40-16 24 16 48-32h16l32 32h24l16-16h16l16-16h72l24 16z" fill="#c47220" />
            <path d="M488 320v168H24V312l24-24h32l80 32 24-24h24l16 16h64l40-16h40l72 24z" fill="#b66514" />
            <g fill="#a2590d">
                <path d="M64 400l24-24h16l16 16h24v24l-40 32H88zM184 384v-32l16-16 24 24zM216 408l16 48 64-24-16-32zM304 368l24 24 24-16v-8l-40-16zM408 416l48-24v48l-24 8z" />
            </g>
            <path d="M493 18a8 8 0 00-7-2l-61 16-29-15a8 8 0 00-8 0l-29 14-44-15a8 8 0 00-3 0h-32a8 8 0 00-4 1l-44 22-44-22a8 8 0 00-4-1h-32a8 8 0 00-3 1L89 39 52 17a8 8 0 00-7-1l-24 8a8 8 0 00-5 8v456a8 8 0 008 8h464a8 8 0 008-8V24a8 8 0 00-3-6zM47 33l37 22a8 8 0 007 0l62-23h29l46 23a8 8 0 008 0l46-23h29l46 16a8 8 0 007-1l28-14 28 14a8 8 0 006 1l54-14v110h-78l-22-15a8 8 0 00-4-1h-72a8 8 0 00-6 2l-13 14h-13a8 8 0 00-6 2l-13 14h-18l-29-30a8 8 0 00-6-2h-16a8 8 0 00-4 1l-44 29-20-13a8 8 0 00-7 0l-35 14-20-21a8 8 0 00-6-2H32V38zm433 127v152h-39l-70-24a8 8 0 00-3 0h-40a8 8 0 00-3 1l-39 15h-59l-13-14a8 8 0 00-6-2h-24a8 8 0 00-6 2l-20 21-75-30a8 8 0 00-3-1H48a8 8 0 00-6 2l-10 11V152h13l21 22a8 8 0 009 1l36-14 21 14a8 8 0 008 0l46-31h11l29 30a8 8 0 006 2h24a8 8 0 006-2l13-14h13a8 8 0 006-2l13-14h67l22 15a8 8 0 004 1zM32 480V315l19-19h27l79 31a8 8 0 009-1l21-22h18l13 14a8 8 0 006 2h64a8 8 0 003-1l39-15h37l70 24a8 8 0 003 0h40v152z" />
            <path d="M144 384h-21l-13-14a8 8 0 00-6-2H88a8 8 0 00-6 2l-24 24a8 8 0 00-1 10l24 48a8 8 0 007 4h16a8 8 0 005-2l40-32a8 8 0 003-6v-24a8 8 0 00-8-8zm-8 28l-35 28h-8l-19-38 17-18h10l13 14a8 8 0 006 2h16zM180 391a8 8 0 008 0l40-24a8 8 0 002-13l-24-24a8 8 0 00-12 0l-16 16a8 8 0 00-2 6v32a8 8 0 004 7zm12-36l8-8 11 11-19 12zM287 396a8 8 0 00-8-4l-64 8a8 8 0 00-7 11l16 48a8 8 0 0011 4l64-24a8 8 0 004-11zm-50 50l-10-31 48-6 10 19zM332 399l24-16a8 8 0 004-7v-8a8 8 0 00-5-7l-40-16a8 8 0 00-10 3l-8 16a8 8 0 001 10l24 24a8 8 0 0010 1zm-18-33l2-4 26 11-13 9zM460 385a8 8 0 00-8 0l-48 24a8 8 0 00-2 12l24 32a8 8 0 009 3l24-8a8 8 0 005-8v-48a8 8 0 00-4-7zm-12 49l-13 5-15-20 28-14zM72 328h16v16H72zM136 448h16v16h-16zM176 432h16v16h-16zM248 352h16v16h-16zM352 416h16v16h-16zM392 336h16v16h-16zM424 352h16v16h-16zM328 440h16v16h-16zM64 240h24v16H64zM96 192h24v16H96zM48 104h24v16H48zM280 200h24v16h-24zM304 232h24v16h-24zM384 192h24v16h-24zM400 240h24v16h-24zM128 240h16v16h-16zM216 248h16v16h-16zM344 88h16v16h-16zM424 64h16v16h-16zM432 112h16v16h-16zM208 72h16v16h-16zM224 112h16v16h-16zM440 256h16v16h-16zM168 200h24v16h-24zM304 64h24v16h-24zM105 71h16v16h-16z" />
        </svg>
    )
}

SoilTypeIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { SoilTypeIcon };