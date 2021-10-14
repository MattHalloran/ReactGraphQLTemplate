import React from 'react';
import {
    ContactInfo,
    PopupMenu
} from 'components';
import { actionsToList, actionToIconButton, actionsToMenu, createAction, getUserActions, LINKS } from 'utils';
import { Container, List, Theme } from '@material-ui/core';
import {
    Info as InfoIcon,
    PhotoLibrary as PhotoLibraryIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useHistory } from 'react-router-dom';
import { CommonProps } from 'types';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        marginTop: '0px',
        marginBottom: '0px',
        right: '0px',
        padding: '0px',
    },
    navItem: {
        background: 'transparent',
        color: theme.palette.primary.contrastText,
        textTransform: 'none',
    },
    menuItem: {
        color: theme.palette.primary.contrastText,
    },
    menuIcon: {
        fill: theme.palette.primary.contrastText,
    },
    contact: {
        width: 'calc(min(100vw, 400px))',
        height: '300px',
    },
}));

export const NavList = ({
    business,
    userRoles,
    cart,
}: Pick<CommonProps, 'business' | 'userRoles' | 'cart'>) => {
    const classes = useStyles();
    const history = useHistory();

    let nav_actions = getUserActions({ userRoles, cart });
    let about_actions = [
        ['About Us', 'about', LINKS.About, null, InfoIcon],
        ['Gallery', 'gallery', LINKS.Gallery, null, PhotoLibraryIcon]
    ].map(a => createAction(...a))

    // Cart is the only option displayed as an icon
    let cart_button;
    const cart_action = nav_actions.filter(a => a.value === 'cart');
    if (cart_action.length > 0) {
        nav_actions = nav_actions.filter(a => a.value !== 'cart');
        cart_button = actionToIconButton({ action:cart_action[0], history });
    }

    return (
        <Container className={classes.root}>
            <PopupMenu
                text="Contact"
                variant="text"
                size="large"
                className={classes.navItem}
            >
                <ContactInfo className={classes.contact} business={business} />
            </PopupMenu>
            <PopupMenu
                text="About"
                variant="text"
                size="large"
                className={classes.navItem}
            >
                <List>
                    {actionsToList({
                        actions: about_actions,
                        history,
                        classes: { listItem: classes.menuItem, listItemIcon: classes.menuIcon },
                    })}
                </List>
            </PopupMenu>
            {actionsToMenu({
                actions: nav_actions,
                history,
                classes: { button: classes.navItem },
            })}
            {cart_button}
        </Container>
    );
}