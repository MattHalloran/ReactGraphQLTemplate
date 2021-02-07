// Global menu that is accessible from all pages

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { PUBS } from 'consts';
import { StyledBurgerMenu } from './BurgerMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import ClickOutside from 'components/shared/wrappers/ClickOutside/ClickOutside';
import { getTheme } from 'storage';

function BurgerMenu({
    theme = getTheme(),
    children,
    visible,
    ...props
}) {
    const history = useHistory();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
            console.log('I GOTTA PEEE', b)
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(openSub);
        })
    }, [])

    const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');
    const closeMenu = () => PubSub.publish(PUBS.BurgerMenuOpen, false);

    useEffect(() => {
        //Closes menu on url change
        let unlisten = history?.listen(() => closeMenu());
        return () => {
            if (typeof unlisten === 'function') unlisten();
        }
    }, [history, closeMenu])

    return ReactDOM.createPortal(
        <StyledBurgerMenu theme={theme} open={open} visible={visible} {...props}>
            <div id="overlay" />
            <ClickOutside {...props} active={open} on_click_outside={closeMenu} >
                <div className="burger" onClick={toggleOpen}>
                    <div />
                    <div />
                    <div />
                </div>
                <MenuContainer open={open} closeMenu={closeMenu}>
                    {children}
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                    <p>AAAAAAAAAAAAA</p>
                </MenuContainer>
            </ClickOutside>
        </StyledBurgerMenu>,
        document.body
    );
}

BurgerMenu.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.any,
    visible: PropTypes.bool,
};

export default BurgerMenu;