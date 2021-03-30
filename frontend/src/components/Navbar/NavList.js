import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { clearStorage, getSession, getRoles } from 'utils/storage';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { LINKS, PUBS } from 'utils/consts';
import PubSub from 'utils/pubsub';
import { Container, Button, IconButton, Badge, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PopupMenu from 'components/PopupMenu/PopupMenu';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import getUserActions from 'utils/userActions';
import _ from 'underscore';
import { updateArray } from 'utils/arrayTools';
import InfoIcon from '@material-ui/icons/Info';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import HomeIcon from '@material-ui/icons/Home';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        marginTop: '0px',
        marginBottom: '0px',
        right: '0px',
        padding: '0px',
    },
    navItem: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        textTransform: 'none',
    },
    contact: {
        width: '300px',
        height: '300px',
    },
}));

function NavList(props) {
    let history = useHistory();
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [user_roles, setUserRoles] = useState(getRoles());

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
        })
    }, [])
    
    let nav_options = getUserActions(session, user_roles, props.cart);

    let cart;
    // If someone is not logged in, display sign up/log in links
    if (!session) {
        nav_options.push(['Sign Up', 'signup', LINKS.Register]);
    } else {
        // Cart option is rendered differently, so we must take it out of the array
        let cart_index = nav_options.length - 1;
        let cart_option = nav_options[cart_index];
        // Replace cart option with log out option
        nav_options = updateArray(nav_options, cart_index, ['Log Out', 'logout', LINKS.Home, clearStorage]);
        cart = (
            <IconButton edge="start" color="inherit" aria-label={cart_option[1]} onClick={() => history.push(LINKS.Cart)}>
                <Badge badgeContent={cart_option[5]} color="error">
                    <ShoppingCartIcon />
                </Badge>
            </IconButton>
        );
    }

    let about_options = [
        ['About Us', 'about', LINKS.About, null, InfoIcon],
        ['Gallery', 'gallery', LINKS.Gallery, null, PhotoLibraryIcon]
    ]

    const optionsToList = (options) => {
        return options.map(([label, value, link, onClick, Icon], index) => (
            <ListItem className={classes.menuItem} button key={index} onClick={() => { history.push(link); if (onClick) onClick() }}>
                {Icon ?
                    (<ListItemIcon>
                            <Icon className={classes.menuIcon} />
                    </ListItemIcon>) : null}
                <ListItemText primary={label} />
            </ListItem>
        ))
    }

    const optionsToMenu = (options) => {
        return options.map(([label, value, link, onClick], index) => (
            <Button
                key={index}
                variant="text"
                size="large"
                className={classes.navItem}
                onClick={() => { history.push(link); if(onClick) onClick()}}
            >
                {label}
            </Button>
        ));
    }

    return (
        <Container className={classes.root}>
            <PopupMenu 
                text="Contact"
                variant="text"
                size="large"
                className={classes.navItem}
            >
                <ContactInfo className={classes.contact} />
            </PopupMenu>
            <PopupMenu
                text="About"
                variant="text"
                size="large"
                className={classes.navItem}
            >
                <List>
                    {optionsToList(about_options)}
                </List>
            </PopupMenu>
            {optionsToMenu(nav_options)}
            {cart}
        </Container>
    );
}

NavList.propTypes = {

}

export default NavList;