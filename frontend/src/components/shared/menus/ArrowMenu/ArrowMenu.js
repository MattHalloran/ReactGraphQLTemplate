// Menu for a specific page

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledArrowMenu } from './ArrowMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import { getTheme } from 'theme';
import Draggable from 'components/shared/Draggable/Draggable';
import { ArrowRightCircle } from 'react-bootstrap-icons';

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
            <ArrowRightCircle size={50} className="arrow" onClick={props.onClick} onDrag={handleDrag} onDragEnd={handleDrag} />
        </Draggable>
    );
}

Arrow.propTypes = {
    onClick: PropTypes.func.isRequired,
}