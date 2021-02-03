// Menu for a specific page

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledArrowMenu } from './ArrowMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import { getTheme } from 'storage';
import Draggable from 'components/shared/Draggable/Draggable';
import ArrowRightCircleIcon from 'assets/img/ArrowRightCircleIcon';

function ArrowMenu(props) {
    let theme = props.theme ?? getTheme();
    let [open, setOpen] = useState(false);

    const closeMenu = () => {
        setOpen(false);
    }

    const toggleOpen = () => {
        console.log('BOOOOOOOOO')
        setOpen(o => !o);
    }

    return (
        <StyledArrowMenu theme={theme} open={open}>
            <div id="overlay"/>
            <Arrow onClick={toggleOpen} />
            <MenuContainer side="left" open={open} closeMenu={closeMenu}>
                {props.children}
            </MenuContainer>
        </StyledArrowMenu>
    );
}

ArrowMenu.propTypes = {
    theme: PropTypes.object,
}

export default ArrowMenu;

function Arrow(props) {
    const [yPos, setYPos] = useState(0);
    const handleDrag = (event) => event.stopPropagation();
    return (
        <Draggable x={0} y={yPos} onMove={(_,y) => setYPos(y-100)}>
            <span onClick={props.onClick}><ArrowRightCircleIcon width="50px" height="50px" className="arrow" onDrag={handleDrag} onDragEnd={handleDrag} /></span>
        </Draggable>
    );
}

Arrow.propTypes = {
    onClick: PropTypes.func.isRequired,
}