import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import BurgerMenu from 'components/menus/BurgerMenu/BurgerMenu';
import Logo from 'assets/img/nln-logo-colorized.png';
import { clearStorage, getTheme, getSession, getRoles } from 'utils/storage';
import { StyledNavbar } from './Navbar.styled';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import { BUSINESS_NAME, USER_ROLES, LINKS, PUBS } from 'utils/consts';
import PopupMenu from 'components/menus/PopupMenu/PopupMenu';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { BagPlusIcon, PersonIcon, ShoppingCartIcon, XIcon, GearIcon, PersonPlusIcon } from 'assets/img';
import PubSub from 'utils/pubsub';
import { SocialIcon } from 'react-social-icons';

const SHOW_HAMBURGER_AT = 800;

function Navbar({
    theme = getTheme(),
    visible,
    ...props
}) {
    const [show_hamburger, setShowHamburger] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener("resize", updateWindowDimensions);

        return () => window.removeEventListener("resize", updateWindowDimensions);
    }, []);

    const updateWindowDimensions = () => setShowHamburger(window.innerWidth <= SHOW_HAMBURGER_AT);

    return (
        <StyledNavbar theme={theme} visible={visible}>
            <Link to={LINKS.Home} className="nav-brand">
                <img src={Logo} alt={`${BUSINESS_NAME} Logo`} className="nav-logo" />
                <span className="nav-name">{BUSINESS_NAME}</span>
            </Link>
            {show_hamburger ? <Hamburger theme={theme} {...props} /> : <NavList {...props} />}
        </StyledNavbar>
    );
}

Navbar.propTypes = {
    theme: PropTypes.object,
    session: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    user_roles: PropTypes.array,
}

function Hamburger(props) {
    const [session, setSession] = useState(getSession());
    const [user_roles, setUserRoles] = useState(getRoles());
    const [theme, setTheme] = useState(getTheme());
    let history = useHistory();
    let nav_options = [];
    let top_links = [];

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(roleSub);
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    // If an admin is logged in, display admin links
    let roles = user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                top_links.push([LINKS.Admin, GearIcon]);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (session === null) {
        top_links.push([LINKS.LogIn, PersonPlusIcon]);
    } else {
        top_links.push([LINKS.Shopping, BagPlusIcon],
            [LINKS.Profile, PersonIcon],
            [LINKS.Cart, ShoppingCartIcon],);
    }

    nav_options.push([LINKS.Gallery, 'Gallery'],
        [LINKS.About, 'About Us']);

    if (session !== null) {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
    }

    return (
        <BurgerMenu theme={theme} {...props}>
            <div className="icon-container" style={{margin: '10px 5px 10px 5px'}}>
                {top_links.map(([link, Icon], index) => (
                    <Icon key={index} width="40px" height="40px" onClick={() => history.push(link)} />
                ))}
                <XIcon width="40px" height="40px" onClick={() => PubSub.publish(PUBS.BurgerMenuOpen, false)} />
            </div>
            <Collapsible title="Contact" initial_open={true}>
                <ContactInfo />
            </Collapsible>
            { nav_options.map(([link, text, onClick], index) => (
                <p key={index}><Link to={link} onClick={onClick}>{text}</Link></p>
            ))}
            <div className="bottom">
                <SocialIcon fgColor="#ffffff" url="https://www.facebook.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
                <SocialIcon fgColor="#ffffff" url="https://www.instagram.com/newlifenurseryinc/" target="_blank" rel="noopener noreferrer" />
            </div>
        </BurgerMenu>
    );
}

Hamburger.propTypes = {
    
}

function NavList() {
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
    console.log('IN NAVLIST', session, user_roles)

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

    let cart;
    // If someone is not logged in, display sign up/log in links
    if (session === null) {
        nav_options.push([LINKS.Register, 'Sign Up'],
            [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
        cart = (
            <Link to={LINKS.Cart}><ShoppingCartIcon className="iconic" width="30px" height="30px"/></Link>
        );
    }

    about_options.push([LINKS.About, 'About Us'],
        [LINKS.Contact, 'Contact Us'],
        [LINKS.Gallery, 'Gallery']);

    const options_to_menu = (options) => {
        return options.map(([link, text, onClick], index) => (
            <li className="nav-item" key={index}>
                <Link className="nav-link" to={link} onClick={onClick}>{text}</Link>
            </li>
        ));
    }

    return (
        <ul className="nav-list">
            <PopupMenu obj={<p style={{marginRight:'10px'}}>Contact</p>}
                menu={<ContactInfo />} />
            <PopupMenu obj={<p style={{marginRight:'8px'}}>About</p>} menu={options_to_menu(about_options)} />
            {options_to_menu(nav_options)}
            {cart}
        </ul>
    );
}

NavList.propTypes = {
    
}

export default Navbar;