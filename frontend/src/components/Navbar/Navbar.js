import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Logo from 'assets/img/nln-logo-colorized.png';
import { FULL_BUSINESS_NAME, LINKS } from 'utils/consts';
import { AppBar, Toolbar, Typography, Slide, IconButton, useScrollTrigger, Container } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Hamburger from './Hamburger';
import NavList from './NavList';
import { useHistory } from 'react-router';
import { hexToRGB } from 'utils/opacityHex';

const SHOW_HAMBURGER_AT = 800;

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
        background: theme.palette.type === 'light' ? '#0c3a0b' : 'radial-gradient(circle at center, #757565 0, #757565, white 100%)',
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
    ...props
}) {
    let history = useHistory();
    const classes = useStyles();
    const [show_hamburger, setShowHamburger] = useState(false);

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
                    <div className={classes.navLogoContainer} onClick={() => history.push(LINKS.Home)}>
                        <div className={classes.navLogoDiv}>
                            <img src={Logo} alt={`${FULL_BUSINESS_NAME} Logo`} className={classes.navLogo} />
                        </div>
                        <Typography className={classes.navName} variant="h6" noWrap>{FULL_BUSINESS_NAME}</Typography>
                    </div>
                    <div className={classes.toRight}>
                        {show_hamburger ? <Hamburger {...props} /> : <NavList {...props} />}
                    </div>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
}

Navbar.propTypes = {
    session: PropTypes.object,
    user_roles: PropTypes.array,
}

export default Navbar;