// Global menu that is accessible from all pages

import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import MenuContainer from '../MenuContainer/MenuContainer';
import { Portal } from 'components/Portal/Portal';
import { IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
    },
}));

function BurgerMenu({
    children,
    ...props
}) {
    let history = useHistory();
    const classes = useStyles();
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
        <div className={classes.root} open={open} {...props}>
            <div id="overlay" />
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleOpen}>
                <MenuIcon />
            </IconButton>
            <Portal>
                <MenuContainer open={open} closeMenu={closeMenu}>
                    {children}
                </MenuContainer>
            </Portal>
        </div>
    );
}

BurgerMenu.propTypes = {
    children: PropTypes.any,
};

export default BurgerMenu;