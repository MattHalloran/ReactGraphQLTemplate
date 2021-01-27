import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BurgerMenu from '../menus/BurgerMenu/BurgerMenu';
import Logo from 'assets/img/NLN-logo-v4-orange2-not-transparent-xl.png';
import * as authQuery from 'query/auth';
import { StyledNavbar } from './Navbar.styled';
import { FaShoppingCart } from 'react-icons/fa';
import ContactInfo from 'components/shared/ContactInfo/ContactInfo';
import { BUSINESS_NAME, USER_ROLES, LINKS } from 'consts';

const SHOW_HAMBURGER_AT = 800;

function Navbar(props) {
    let [show_hamburger, setShowHamburger] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener("resize", updateWindowDimensions);

        return () => window.removeEventListener("resize", updateWindowDimensions);
    }, []);

    const updateWindowDimensions = () => setShowHamburger(window.innerWidth <= SHOW_HAMBURGER_AT);

    return (
        <StyledNavbar visible={props.visible}>
            <Link to={LINKS.Home} className="nav-brand">
                <img src={Logo} alt={`${BUSINESS_NAME} Logo`} className="nav-logo" />
                <span className="nav-name">{BUSINESS_NAME}</span>
            </Link>
            {show_hamburger ? <Hamburger {...props} /> : <NavList {...props} />}
        </StyledNavbar>
    );
}

Navbar.propTypes = {
    session: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    user_roles: PropTypes.array,
}

function Hamburger(props) {
    let nav_options = [];

    // If an admin is logged in, display admin links
    let roles = props.user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                nav_options.push([LINKS.Admin, 'Admin']);
            }
        })
    }

    // If someone is not logged in, display sign up/log in links
    if (props.session === null) {
        nav_options.push([LINKS.Register, 'Sign Up'],
                         [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Shopping, 'Shopping'])
        nav_options.push([LINKS.Profile, 'Profile']);
    }

    nav_options.push([LINKS.Gallery, 'Gallery'],
                     [LINKS.About, 'About Us'],
                     [LINKS.Contact, 'Contact Us']);

    if (props.session !== null) {
        nav_options.push([LINKS.Home, 'Log Out', authQuery.logout]);
    }
    
    return (
        <BurgerMenu {...props}>
            { nav_options.map(([link, text, onClick], index) => (
                <p key={index}><Link to={link} onClick={onClick}>{text}</Link></p>
            ))}
            <ContactInfo />
        </BurgerMenu>
    );
}

function NavList(props) {
    // Link, Link text, onClick function
    let nav_options = [];

    if (props.session !== null) {
        nav_options.push([LINKS.Shopping, 'Shopping']);
        nav_options.push([LINKS.Profile, 'Profile']);
    }

    nav_options.push([LINKS.Gallery, 'Gallery'],
                     [LINKS.About, 'About Us'],
                     [LINKS.Contact, 'Contact Us']);
    
    // If an admin is logged in, display admin links
    let roles = props.user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === USER_ROLES.Admin) {
                nav_options.push([LINKS.Admin, 'Admin']);
            }
        })
    }
    
    // If someone is not logged in, display sign up/log in links
    if (props.session === null) {
        nav_options.push([LINKS.Register, 'Sign Up'],
                         [LINKS.LogIn, 'Log In']);
    } else {
        nav_options.push([LINKS.Home, 'Log Out', authQuery.logout]);
    }

    return (
        <ul className="nav-list">
            { nav_options.map(([link, text, onClick], index) => (
                <li className="nav-item" key={index}>
                    <Link className="nav-link" to={link} onClick={onClick}>{text}</Link>
                </li>
            ))}
        </ul>
    );
}

NavList.propTypes = {
    session: PropTypes.object,
    user_roles: PropTypes.array,
}

export default Navbar;