// Menu for a specific page

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledArrowMenu } from './ArrowMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import { getTheme } from 'utils/storage';
import Draggable from 'components/Draggable/Draggable';
import ArrowRightCircleIcon from 'assets/img/ArrowRightCircleIcon';

function ArrowMenu({
    theme=getTheme(),
    children,
}) {
    const [open, setOpen] = useState(false);

    const closeMenu = () => {
        setOpen(false);
    }

    const toggleOpen = () => {
        setOpen(o => !o);
    }

    return (
        <StyledArrowMenu theme={theme} open={open}>
            <div id="overlay"/>
            <Arrow onClick={toggleOpen} />
            <MenuContainer side="left" open={open} closeMenu={closeMenu}>
                {children}
            </MenuContainer>
        </StyledArrowMenu>
    );
}

ArrowMenu.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.any,
}

export default ArrowMenu;

function Arrow({onClick}) {
    const [yPos, setYPos] = useState(0);
    const handleDrag = (event) => event.stopPropagation();
    return (
        <Draggable x={0} y={yPos} onMove={(_,y) => setYPos(y-100)}>
            <span onClick={onClick}><ArrowRightCircleIcon width="50px" height="50px" className="arrow" onDrag={handleDrag} onDragEnd={handleDrag} /></span>
        </Draggable>
    );
}

Arrow.propTypes = {
    onClick: PropTypes.func.isRequired,
}