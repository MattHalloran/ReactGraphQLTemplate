import PropTypes from 'prop-types';

function RangeIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={props.className}
            aria-labelledby="title"
            width={props.width}
            height={props.height}
            onClick={() => typeof props.onClick === 'function' && props.onClick()}>
            <title id="title">{props.iconTitle ?? 'Light Ranges'}</title>
            <path d="M264 132l-15 15v313l15 15h30V132z" fill="#f63" />
            <path d="M218 132h46v343h-46z" fill="#ff8b47" />
            <path d="M158 38l-15 15v312l15 15h30V38z" fill="#f9b348" />
            <path d="M113 38h45v342h-45z" fill="#f3da49" />
            <path d="M53 132l-15 15v94l15 15h30V132z" fill="#61ce5b" />
            <path d="M8 132h45v124H8z" fill="#94e368" />
            <path d="M369 38l-15 15v229l15 15h30V38z" fill="#9255e3" />
            <path d="M324 38h45v259h-45z" fill="#ae7df0" />
            <path d="M475 90l-15 15v219l15 15h30V90z" fill="#373e9f" />
            <path d="M429 90h46v249h-46z" fill="#3857bc" />
            <path d="M83 124H8c-5 0-8 4-8 8v124c0 4 3 8 8 8h75c4 0 7-4 7-8V132c0-4-3-8-7-8zm-8 125H15V139h60zM53 279H38a8 8 0 000 15h15a8 8 0 000-15zM38 109h15a8 8 0 000-15H38a8 8 0 000 15zM294 124h-76c-4 0-7 4-7 8v343c0 4 3 7 7 7h76c4 0 7-3 7-7V132c0-4-3-8-7-8zm-8 343h-60V139h60zM264 497h-15a8 8 0 000 15h15a8 8 0 000-15zM249 109h15a8 8 0 000-15h-15a8 8 0 000 15zM188 30h-75c-4 0-8 3-8 8v342c0 4 4 8 8 8h75c4 0 8-4 8-8V38c0-5-4-8-8-8zm-7 343h-61V45h61zM158 403h-15a8 8 0 000 15h15a8 8 0 000-15zM143 15h15a8 8 0 000-15h-15a8 8 0 000 15zM505 83h-76c-4 0-7 3-7 7v249c0 4 3 7 7 7h76c4 0 7-3 7-7V90c0-4-3-7-7-7zm-8 248h-60V98h60zM474 361h-15a8 8 0 000 15h15a8 8 0 000-15zM459 68h15a8 8 0 000-15h-15a8 8 0 000 15zM399 30h-75c-4 0-8 3-8 8v259c0 5 4 8 8 8h75c4 0 8-3 8-8V120a8 8 0 00-15 0v170h-61V45h61v45a8 8 0 0015 0V37c0-4-4-7-8-7zM369 320h-15a8 8 0 000 15h15a8 8 0 000-15zM354 15h15a8 8 0 000-15h-15a8 8 0 000 15z" />
        </svg>
    )
}

RangeIcon.propTypes = {
    iconTitle: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
}

export { RangeIcon };