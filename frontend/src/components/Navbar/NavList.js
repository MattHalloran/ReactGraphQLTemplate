import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { clearStorage, getSession, getRoles } from 'utils/storage';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { USER_ROLES, LINKS, PUBS } from 'utils/consts';
import { ShoppingCartIcon } from 'assets/img';
import PubSub from 'utils/pubsub';
import { Container, Button, IconButton } from '@material-ui/core';
import PopupMenu from 'components/PopupMenu/PopupMenu';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

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
    }
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

    // Link, Link text, onClick function
    let nav_options = [];
    let about_options = [];

    if (session !== null) {
        nav_options.push([LINKS.Shopping, 'Availability']);
        nav_options.push([LINKS.Profile, 'Profile']);
    }

    // If an admin is logged in, display admin links
    if (user_roles instanceof Array) {
        user_roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                nav_options.push([LINKS.Admin, 'Admin']);
            }
        })
    }

    const openLink = (link) => {
        history.push(link);
    }

    let cart;
    // If someone is not logged in, display sign up/log in links
    if (!session) {
        nav_options.push([LINKS.Register, 'Sign Up'],
            [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
        cart = (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => openLink(LINKS.Cart)}>
                <ShoppingCartIcon cart={props.cart} className="iconic" width="30px" height="30px" />
            </IconButton>
        );
    }

    about_options.push([LINKS.About, 'About Us'],
        [LINKS.Contact, 'Contact Us'],
        [LINKS.Gallery, 'Gallery']);

    const options_to_menu = (options) => {
        return options.map(([link, text], index) => (
            <Button
                key={index}
                variant="text"
                size="large"
                className={classes.navItem}
                onClick={() => openLink(link)}
            >
                {text}
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
                {options_to_menu(about_options)}
            </PopupMenu>
            {options_to_menu(nav_options)}
            {cart}
        </Container>
    );
}

NavList.propTypes = {

}

export default NavList;