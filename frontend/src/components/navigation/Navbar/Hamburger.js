import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { clearStorage } from 'utils/storage';
import { 
    ContactInfo,
    Copyright
} from 'components';
import { LINKS, PUBS } from 'utils/consts';
import PubSub from 'utils/pubsub';
import {
    Close as CloseIcon,
    ContactSupport as ContactSupportIcon,
    ExitToApp as ExitToAppIcon,
    ExplandLess as ExplandLessIcon,
    ExplandMore as ExpandMoreIcon,
    Facebook as FacebookIcon,
    Home as HomeIcon,
    Menu as MenuIcon,
    Info as InfoIcon,
    Instagram as InstagramIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Share as ShareIcon,
} from '@material-ui/icons';
import { IconButton, SwipeableDrawer, List, ListItem, ListItemIcon, Badge, Collapse, Divider, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import getUserActions from 'utils/userActions';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        borderLeft: `2px solid ${theme.palette.text.primary}`
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
        fill: '#43609C', // UCLA blue
    },
    instagram: {
        fill: '#F77737',
    },
    copyright: {
        color: theme.palette.primary.contrastText,
        maxWidth: 300,
        padding: 5,
    },
}));

function Hamburger({
    session,
    roles,
    cart
}) {
    const classes = useStyles();
    const [contactOpen, setContactOpen] = useState(true);
    const [socialOpen, setSocialOpen] = useState(false);
    const [open, setOpen] = useState(false);
    let history = useHistory();

    useEffect(() => {
        let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(openSub);
        })
    }, [])

    const closeMenu = () => {console.log('CLOSING MENU');PubSub.publish(PUBS.BurgerMenuOpen, false);}
    const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');

    const handleContactClick = () => {
        setContactOpen(!contactOpen);
    };

    const handleSocialClick = () => {
        setSocialOpen(!socialOpen);
    }

    const newTab = (link) => {
        console.log(link);
        window.open(link, "_blank");
    }

    const optionsToList = (options) => {
        return options.map(([label, value, link, onClick, Icon, badgeNum], index) => (
            <ListItem 
                key={index}
                className={classes.menuItem}
                button
                onClick={() => { 
                    history.push(link); 
                    if (onClick) onClick();
                    closeMenu() 
                }}>
                {Icon ?
                    (<ListItemIcon>
                        <Badge badgeContent={badgeNum ?? 0} color="error">
                            <Icon className={classes.menuIcon} />
                        </Badge>
                    </ListItemIcon>) : null}
                <ListItemText primary={label} />
            </ListItem>
        ))
    }

    let nav_options = [
        ['Home', 'home', LINKS.Home, null, HomeIcon],
        ['About Us', 'about', LINKS.About, null, InfoIcon],
        ['Gallery', 'gallery', LINKS.Gallery, null, PhotoLibraryIcon]
    ]

    let user_actions = getUserActions(session, roles, cart);
    if (session !== null) {
        user_actions.push(['Log Out', 'logout', LINKS.Home, clearStorage, ExitToAppIcon]);
    }

    return (
        <React.Fragment>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleOpen}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="right" open={open} onClose={closeMenu}>
                <IconButton className={classes.close} onClick={closeMenu}>
                    <CloseIcon fontSize="large" />
                </IconButton>
                <List>
                    {/* Collapsible contact information */}
                    <ListItem className={classes.menuItem} button onClick={handleContactClick}>
                        <ListItemIcon><ContactSupportIcon className={classes.menuIcon} /></ListItemIcon>
                        <ListItemText primary="Contact Us" />
                        {contactOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={contactOpen} timeout="auto" unmountOnExit>
                        <ContactInfo />
                    </Collapse>
                    {/* Collapsible social media links */}
                    <ListItem className={classes.menuItem} button onClick={handleSocialClick}>
                        <ListItemIcon><ShareIcon className={classes.menuIcon} /></ListItemIcon>
                        <ListItemText primary="Socials" />
                        {socialOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={socialOpen} timeout="auto" unmountOnExit>
                        <ListItem className={classes.menuItem} button onClick={() => newTab("https://www.facebook.com/newlifenurseryinc/")}>
                            <ListItemIcon>
                                <FacebookIcon className={classes.facebook} />
                            </ListItemIcon>
                            <ListItemText primary="Facebook" />
                        </ListItem>
                        <ListItem className={classes.menuItem} button onClick={() => newTab("https://www.instagram.com/newlifenurseryinc/")}>
                            <ListItemIcon>
                                <InstagramIcon className={classes.instagram} />
                            </ListItemIcon>
                            <ListItemText primary="Instagram" />
                        </ListItem>
                    </Collapse>
                    {optionsToList(nav_options)}
                    <Divider />
                    {optionsToList(user_actions)}
                </List>
                {/* <div style={{ display: 'flex', justifyContent: 'space-around', background: `${theme.lightPrimaryColor}` }}>
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </div>*/}
                <Copyright className={classes.copyright} />
            </SwipeableDrawer>
        </React.Fragment>
    );
}

Hamburger.propTypes = {
    session: PropTypes.object,
    roles: PropTypes.array,
    cart: PropTypes.object,
}

export default Hamburger;