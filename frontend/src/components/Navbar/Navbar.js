import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BurgerMenu from 'components/menus/BurgerMenu/BurgerMenu';
import Logo from 'assets/img/nln-logo-colorized.png';
import { clearStorage, getTheme, getItem } from 'utils/storage';
import { StyledNavbar } from './Navbar.styled';
import ContactInfo from 'components/ContactInfo/ContactInfo';
import MapIcon from 'assets/img/MapIcon';
import { BUSINESS_NAME, USER_ROLES, LINKS, LOCAL_STORAGE, GOOGLE_MAPS_ADDRESS } from 'utils/consts';
import PopupMenu from 'components/menus/PopupMenu/PopupMenu';

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
            {show_hamburger ? <Hamburger visible={visible} theme={theme} {...props} /> : <NavList {...props} />}
        </StyledNavbar>
    );
}

Navbar.propTypes = {
    theme: PropTypes.object,
    session: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    user_roles: PropTypes.array,
}

function Hamburger({
    session = getItem(LOCAL_STORAGE.Session),
    user_roles = getItem(LOCAL_STORAGE.Roles),
    visible,
    theme = getTheme(),
    ...props
}) {
    let nav_options = [];

    // If an admin is logged in, display admin links
    let roles = user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                nav_options.push([LINKS.Admin, 'Admin']);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (session === null) {
        nav_options.push([LINKS.Register, 'Sign Up'],
            [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Shopping, 'Shopping'])
        nav_options.push([LINKS.Profile, 'Profile']);
    }

    nav_options.push([LINKS.Gallery, 'Gallery'],
        [LINKS.About, 'About Us'],
        [LINKS.Contact, 'Contact Us']);

    if (session !== null) {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
    }

    return (
        <BurgerMenu theme={theme} {...props} visible={visible}>
            { nav_options.map(([link, text, onClick], index) => (
                <p key={index}><Link to={link} onClick={onClick}>{text}</Link></p>
            ))}
            <ContactInfo />
        </BurgerMenu>
    );
}

Hamburger.propTypes = {
    theme: PropTypes.object,
    session: PropTypes.object,
    user_roles: PropTypes.array,
    visible: PropTypes.bool,
}

function NavList({
    session = getItem(LOCAL_STORAGE.Session),
    user_roles = getItem(LOCAL_STORAGE.Roles),
}) {
    // Link, Link text, onClick function
    let nav_options = [];
    let about_options = [];
    console.log('IN NAVLIST', session, user_roles)

    if (session !== null) {
        nav_options.push([LINKS.Shopping, 'Shopping']);
        nav_options.push([LINKS.Profile, 'Profile']);
    }

    // If an admin is logged in, display admin links
    if (user_roles instanceof Array) {
        user_roles?.forEach(r => {
            console.log('USER ROLEEE', r)
            if (r.title === USER_ROLES.Admin) {
                nav_options.push([LINKS.Admin, 'Admin']);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (session === null) {
        nav_options.push([LINKS.Register, 'Sign Up'],
            [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Home, 'Log Out', clearStorage]);
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
            <PopupMenu obj={<p>Address</p>}
                menu={<address className="address-container" onClick={() => window.open(GOOGLE_MAPS_ADDRESS, "_blank")}>
                    <MapIcon className="trait-icon" width="25px" height="25px" title="Address" alt="Address" />
                    106 South Woodruff Road<br/>Bridgeton, NJ 08302
                </address>} />
            <PopupMenu obj={<p>About</p>} menu={options_to_menu(about_options)} />
            {options_to_menu(nav_options)}
        </ul>
    );
}

NavList.propTypes = {
    session: PropTypes.object,
    user_roles: PropTypes.array,
}

export default Navbar;