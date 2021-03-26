import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { clearStorage, getSession, getRoles } from 'utils/storage';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { FULL_BUSINESS_NAME, LINKS, PUBS } from 'utils/consts';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { XIcon } from 'assets/img';
import PubSub from 'utils/pubsub';
import { SocialIcon } from 'react-social-icons';
import { IconButton, SwipeableDrawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Copyright from 'components/Copyright/Copyright';
import getUserActions from 'utils/userActions';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        background: theme.palette.primary.light,
        borderLeft: `2px solid ${theme.palette.text.primary}`
    }
}));

function Hamburger(props) {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [user_roles, setUserRoles] = useState(getRoles());
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

    let nav_options = getUserActions(session, user_roles, props.cart);
    if (session !== null) {
        nav_options.push(['Log Out', 'logout', LINKS.Home, clearStorage]);
    }

    const closeMenu = () => PubSub.publish(PUBS.BurgerMenuOpen, false);
    const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');

    return (
        <React.Fragment>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleOpen}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer classes={{ paper: classes.drawerPaper }} anchor="right" open={open} onClose={closeMenu}>
                <XIcon width="40px" height="40px" onClick={() => PubSub.publish(PUBS.BurgerMenuOpen, false)} />
                <Collapsible contentClassName='' title="Contact" initial_open={true}>
                    <ContactInfo />
                </Collapsible>
                <List>
                    {nav_options.map(([label, value, link, onClick], index) => (
                        <ListItem button key={index} onClick={() => {history.push(link); if(onClick) onClick()}}>
                            <ListItemText primary={label} />
                        </ListItem>
                    ))}
                </List>
                {/* <div style={{ display: 'flex', justifyContent: 'space-around', background: `${theme.lightPrimaryColor}` }}>
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon style={{ marginBottom: '0' }} fgColor={theme.headerText} url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </div>*/}
                <Copyright />
            </SwipeableDrawer>
        </React.Fragment>
    );
}

Hamburger.propTypes = {

}

export default Hamburger;