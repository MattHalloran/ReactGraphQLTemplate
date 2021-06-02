import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Logo from 'assets/img/nln-logo-colorized.png';
import { BUSINESS_NAME } from '@local/shared';
import { hexToRGB, LINKS } from 'utils';
import { AppBar, Toolbar, Typography, Slide, useScrollTrigger } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Hamburger } from './Hamburger';
import { NavList } from './NavList';
import { logoutMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';

const SHOW_HAMBURGER_AT = 960;

const useStyles = makeStyles((theme) => ({
    toRight: {
        marginLeft: 'auto',
    },
    navLogoContainer: {
        padding: 0,
        display: 'flex',
        alignItems: 'center',
    },
    navLogoDiv: {
        display: 'flex',
        padding: 0,
        cursor: 'pointer',
        marginTop: '5px',
        marginBottom: '5px',
        marginRight: 'auto',
        background: theme.palette.mode === 'light' ? '#0c3a0b' : 'radial-gradient(circle at center, #757565 0, #757565, white 100%)',
        borderRadius: '500px',
        minHeight: '50px',
        minWidth: '50px',
        height: '12vh',
        width: '12vh',
    },
    navLogo: {
        '-webkit-filter': `drop-shadow(0.5px 0.5px 0 ${hexToRGB(theme.palette.primary.dark, 0.9)})
                        drop-shadow(-0.5px -0.5px 0 ${hexToRGB(theme.palette.primary.dark, 0.9)})`,
        filter: `drop-shadow(0.5px 0.5px 0 ${hexToRGB(theme.palette.primary.dark, 0.9)}) 
                drop-shadow(-0.5px -0.5px 0 ${hexToRGB(theme.palette.primary.dark, 0.9)})`,
        verticalAlign: 'middle',
        fill: 'black',
        marginTop: '0.5vh',
        marginLeft: 'max(-5px, -5vw)',
        minHeight: '50px',
        height: "12vh",
        transform: 'rotate(20deg)',
        //filter: invert(1);
    },
    navName: {
        position: 'relative',
        cursor: 'pointer',
        fontSize: '2em',
        marginLeft: '-15px',
        fontFamily: `'Kite One', sans-serif`,
        color: theme.palette.primary.contrastText,
    },
    [theme.breakpoints.down(500)]: {
        navName: {
            fontSize: '1.5em',
        }
    },
    [theme.breakpoints.down(350)]: {
        navName: {
            display: 'none',
        }
    },
}));

function HideOnScroll({
    children,
}) {
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
};

function Navbar({
    session,
    onSessionUpdate,
    roles,
    cart,
    onRedirect
}) {
    const classes = useStyles();
    const [show_hamburger, setShowHamburger] = useState(false);
    const [logout] = useMutation(logoutMutation);

    const logoutUser = () => {
        logout().then(() => {
            onSessionUpdate(null);
            onRedirect(LINKS.Home);
        }).catch(() => {})
    }

    let child_props = { 
        session: session, 
        onSessionUpdate: onSessionUpdate,
        logout: logoutUser,
        roles: roles, 
        cart: cart,
        onRedirect: onRedirect
    }

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener("resize", updateWindowDimensions);

        return () => window.removeEventListener("resize", updateWindowDimensions);
    }, []);

    const updateWindowDimensions = () => setShowHamburger(window.innerWidth <= SHOW_HAMBURGER_AT);

    return (
        <HideOnScroll>
            <AppBar>
                <Toolbar>
                    <div className={classes.navLogoContainer} onClick={() => onRedirect(LINKS.Home)}>
                        <div className={classes.navLogoDiv}>
                            <img src={Logo} alt={`${BUSINESS_NAME.Short} Logo`} className={classes.navLogo} />
                        </div>
                        <Typography className={classes.navName} variant="h6" noWrap>{BUSINESS_NAME.Short}</Typography>
                    </div>
                    <div className={classes.toRight}>
                        {show_hamburger ? <Hamburger {...child_props} /> : <NavList {...child_props} />}
                    </div>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
}

Navbar.propTypes = {
    session: PropTypes.object,
    roles: PropTypes.array,
    cart: PropTypes.object,
}

export { Navbar };