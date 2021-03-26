import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { clearStorage, getSession, getRoles } from 'utils/storage';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { LINKS, PUBS } from 'utils/consts';
import PubSub from 'utils/pubsub';
import InfoIcon from '@material-ui/icons/Info';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import HomeIcon from '@material-ui/icons/Home';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ShareIcon from '@material-ui/icons/Share';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import { IconButton, SwipeableDrawer, List, ListItem, ListItemIcon, Badge, Collapse, Divider, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Copyright from 'components/Copyright/Copyright';
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

function Hamburger(props) {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [user_roles, setUserRoles] = useState(getRoles());
    const [contactOpen, setContactOpen] = useState(true);
    const [socialOpen, setSocialOpen] = useState(false);
    const [open, setOpen] = useState(false);
    let history = useHistory();

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
            setOpen(open => b === 'toggle' ? !open : b);
        });
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
            PubSub.unsubscribe(openSub);
        })
    }, [])

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
            <ListItem className={classes.menuItem} button key={index} onClick={() => { history.push(link); if (onClick) onClick() }}>
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

    let user_actions = getUserActions(session, user_roles, props.cart);
    if (session !== null) {
        user_actions.push(['Log Out', 'logout', LINKS.Home, clearStorage, ExitToAppIcon]);
    }

    const closeMenu = () => PubSub.publish(PUBS.BurgerMenuOpen, false);
    const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');

    return (
        <React.Fragment>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleOpen}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="right" open={open} onClose={closeMenu}>
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

}

export default Hamburger;