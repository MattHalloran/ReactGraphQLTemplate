import { useCallback, useEffect, useState } from 'react';
import { ContactInfo } from 'components';
import { actionsToList, createActions, getUserActions, LINKS, PUBS } from 'utils';
import PubSub from 'pubsub-js';
import {
    Close as CloseIcon,
    ContactSupport as ContactSupportIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Facebook as FacebookIcon,
    Menu as MenuIcon,
    Info as InfoIcon,
    Instagram as InstagramIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Share as ShareIcon,
} from '@material-ui/icons';
import { IconButton, SwipeableDrawer, List, ListItem, ListItemIcon, Collapse, Divider, ListItemText, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@material-ui/core';
import { CopyrightBreadcrumbs } from 'components';
import { useHistory } from 'react-router';
import { CommonProps } from 'types';

const useStyles = makeStyles((theme: Theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        borderLeft: `1px solid ${theme.palette.text.primary}`,
    },
    menuItem: {
        color: theme.palette.primary.contrastText,
        borderBottom: `1px solid ${theme.palette.primary.dark}`,
    },
    close: {
        color: theme.palette.primary.contrastText,
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.primary.dark}`,
        justifyContent: 'end',
        direction: 'rtl',
    },
    menuIcon: {
        color: theme.palette.primary.contrastText,
    },
    facebook: {
        fill: '#ffffff', //'#43609C', // UCLA blue
    },
    instagram: {
        fill: '#ffffff', // '#F77737',
    },
    copyright: {
        color: theme.palette.primary.contrastText,
        padding: 5,
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
}));

export const Hamburger = ({
    business,
    userRoles,
    cart,
}: Pick<CommonProps, 'business' | 'userRoles' | 'cart'>) => {
    const classes = useStyles();
    const history = useHistory();
    const theme = useTheme();
    const [contactOpen, setContactOpen] = useState(true);
    const [socialOpen, setSocialOpen] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return () => { PubSub.unsubscribe(openSub) };
    }, [])

    const closeMenu = () => PubSub.publish(PUBS.BurgerMenuOpen, false);
    const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');

    const handleContactClick = () => {
        setContactOpen(!contactOpen);
    };

    const handleSocialClick = () => {
        setSocialOpen(!socialOpen);
    }

    const newTab = useCallback((link: string) => window.open(link, "_blank"), []);

    const nav_actions = getUserActions({ userRoles, cart });
    const about_actions = createActions([
        ['About Us', 'about', LINKS.About, null, InfoIcon, 0],
        ['Gallery', 'gallery', LINKS.Gallery, null, PhotoLibraryIcon, 0]
    ]);

    const openFacebook = useCallback(() => newTab(business?.SOCIAL?.Facebook), [business, newTab]);
    const openInstagram = useCallback(() => newTab(business?.SOCIAL?.Instagram), [business, newTab]);

    return (
        <>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleOpen}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="right" open={open} onOpen={() => { }} onClose={closeMenu}>
                <IconButton className={classes.close} onClick={closeMenu}>
                    <CloseIcon fontSize="large" />
                </IconButton>
                <List>
                    {/* Collapsible contact information */}
                    <ListItem className={classes.menuItem} button onClick={handleContactClick}>
                        <ListItemIcon><ContactSupportIcon className={classes.menuIcon} /></ListItemIcon>
                        <ListItemText primary="Contact Us" />
                        {contactOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    <Collapse className={classes.menuItem} in={contactOpen} timeout="auto" unmountOnExit>
                        <ContactInfo business={business} />
                    </Collapse>
                    {/* Collapsible social media links */}
                    <ListItem className={classes.menuItem} button onClick={handleSocialClick}>
                        <ListItemIcon><ShareIcon className={classes.menuIcon} /></ListItemIcon>
                        <ListItemText primary="Socials" />
                        {socialOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    <Collapse in={socialOpen} timeout="auto" unmountOnExit>
                        <ListItem className={classes.menuItem} button onClick={openFacebook}>
                            <ListItemIcon>
                                <FacebookIcon className={classes.facebook} />
                            </ListItemIcon>
                            <ListItemText primary="Facebook" />
                        </ListItem>
                        <ListItem className={classes.menuItem} button onClick={openInstagram}>
                            <ListItemIcon>
                                <InstagramIcon className={classes.instagram} />
                            </ListItemIcon>
                            <ListItemText primary="Instagram" />
                        </ListItem>
                    </Collapse>
                    {actionsToList({
                        actions: about_actions,
                        history,
                        classes: { listItem: classes.menuItem, listItemIcon: classes.menuIcon },
                        onAnyClick: closeMenu,
                    })}
                    <Divider />
                    {actionsToList({
                        actions: nav_actions,
                        history,
                        classes: { listItem: classes.menuItem, listItemIcon: classes.menuIcon },
                        onAnyClick: closeMenu,
                    })}
                </List>
                <CopyrightBreadcrumbs className={classes.copyright} business={business} textColor={theme.palette.primary.contrastText} />
            </SwipeableDrawer>
        </>
    );
}