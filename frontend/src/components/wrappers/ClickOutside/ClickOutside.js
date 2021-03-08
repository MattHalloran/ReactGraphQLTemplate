import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import makeID from 'utils/makeID';

function ClickOutside({
    active = false,
    on_click_outside,
    children,
    ...props
}) {
    let listenerRef = useRef(null);
    let wrapperID = useRef(makeID(10));

    const handleClickOutside = (event) => {
        if (!document.getElementById(wrapperID.current)?.contains(event.target)) {
            event.stopPropagation();
            on_click_outside();
        }
    }

    if (active && listenerRef.current === null) {
        listenerRef.current = document.addEventListener('mouseup', handleClickOutside);
    } else if (!active && listenerRef.current !== null) {
        document.removeEventListener('mouseup', listenerRef);
        listenerRef.current = null;
    }

    useEffect(() => {
        return (() => {
            if (listenerRef.current !== null)
                document.removeEventListener('mouseup', listenerRef);
        })
    })

    return (
        <div id={wrapperID.current} {...props}>
            {children}
        </div>
    )
}

ClickOutside.propTypes = {
    children: PropTypes.any.isRequired,
    on_click_outside: PropTypes.func.isRequired,
    active: PropTypes.bool,
}

export default ClickOutside;