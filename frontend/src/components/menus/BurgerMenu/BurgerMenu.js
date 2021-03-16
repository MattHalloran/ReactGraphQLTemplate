// Global menu that is accessible from all pages

import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { StyledBurgerMenu } from './BurgerMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import { getTheme } from 'utils/storage';
import { Portal } from 'components/Portal/Portal';

function BurgerMenu({
    theme = getTheme(),
    children,
    ...props
}) {
    const history = useHistory();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
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

    return (
        <StyledBurgerMenu theme={theme} open={open} {...props}>
            <div id="overlay" />
            <div className="burger" onClick={toggleOpen}>
                <div />
                <div />
                <div />
            </div>
            <Portal>
                <MenuContainer open={open} closeMenu={closeMenu}>
                    {children}
                </MenuContainer>
            </Portal>
        </StyledBurgerMenu>
    );
}

BurgerMenu.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.any,
};

export default BurgerMenu;