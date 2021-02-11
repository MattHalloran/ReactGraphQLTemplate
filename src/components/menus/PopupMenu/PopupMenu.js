import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledPopupMenu } from './PopupMenu.styled';
import useOutsideClick from 'utils/useOutsideClick';

function PopupMenu({
    theme = getTheme(),
    obj,
    menu,
}) {
    const [open, setOpen] = useState(false);
    const clickRef = useRef();

    const open_menu = (event) => {
        event.preventDefault();
        setOpen(true);
    }

    useOutsideClick(clickRef, useCallback(() => {
        console.log('OUTSIDE CLICK');
        if(open) setOpen(false)
    },[open]));

    return (
        <StyledPopupMenu theme={theme} onClick={open_menu}>
            { obj }
            { open ? ( <div ref={clickRef} className="popup-menu-container">
                            { menu }
                        </div>
                    ) : null
            }
        </StyledPopupMenu>
    );
}

PopupMenu.propTypes = {
    theme: PropTypes.object,
    obj: PropTypes.any,
    menu: PropTypes.any,
}

export default PopupMenu;