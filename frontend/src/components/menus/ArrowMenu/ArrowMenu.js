// Menu for a specific page

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledArrowMenu } from './ArrowMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import { getTheme } from 'utils/storage';
import Draggable from 'components/Draggable/Draggable';
import ArrowRightCircleIcon from 'assets/img/ArrowRightCircleIcon';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';

function ArrowMenu({
    theme=getTheme(),
    children,
    ...props
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.ArrowMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(openSub);
        })
    }, [])

    const toggleOpen = () => PubSub.publish(PUBS.ArrowMenuOpen, 'toggle');
    const closeMenu = () => PubSub.publish(PUBS.ArrowMenuOpen, false);

    return (
        <StyledArrowMenu theme={theme} open={open} {...props}>
            <div id="overlay"/>
            {/* <Arrow onClick={toggleOpen} /> */}
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