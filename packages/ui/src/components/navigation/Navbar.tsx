import React, { useEffect, useState } from 'react';
import Logo from 'assets/img/Logo.svg';
import { LINKS } from 'utils';
import { AppBar, Toolbar, Typography, Slide, useScrollTrigger, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Hamburger } from './Hamburger';
import { NavList } from './NavList';
import { logoutMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';

const SHOW_HAMBURGER_AT = 1000;

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        background: theme.palette.primary.main,
    },
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
        margin: '5px',
        borderRadius: '500px',
    },
    navLogo: {
        verticalAlign: 'middle',
        fill: 'black',
        marginLeft: 'max(-5px, -5vw)',
        minWidth: '50px',
        minHeight: '50px',
        width: '12vh',
        height: '12vh',
    },
    navName: {
        position: 'relative',
        cursor: 'pointer',
        fontSize: '2em',
        fontFamily: `Lato`,
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

interface HideOnScrollProps {
    children: React.ReactNode;
}

const HideOnScroll: React.FC<HideOnScrollProps> = ({
    children,
}) => {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

interface Props {
    session: any;
    business: any;
    roles: any[];
    cart: any;
    onSessionUpdate: () => any;
    onRedirect: () => any;
}

export const Navbar: React.FC<Props> = ({
    session,
    business,
    onSessionUpdate,
    roles,
    cart,
    onRedirect
}) => {
    const classes = useStyles();
    const [show_hamburger, setShowHamburger] = useState(false);
    const [logout] = useMutation(logoutMutation);

    const logoutCustomer = () => {
        logout().then(() => {
            onSessionUpdate();
            onRedirect(LINKS.Home);
        }).catch(() => {})
    }

    let child_props = { 
        session: session, 
        business: business,
        onSessionUpdate: onSessionUpdate,
        logout: logoutCustomer,
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
                <Toolbar className={classes.root}>
                    <div className={classes.navLogoContainer} onClick={() => onRedirect(LINKS.Home)}>
                        <div className={classes.navLogoDiv}>
                            <img src={Logo} alt={`${business?.BUSINESS_NAME?.Short} Logo`} className={classes.navLogo} />
                        </div>
                        <Typography className={classes.navName} variant="h6" noWrap>{business?.BUSINESS_NAME?.Short}</Typography>
                    </div>
                    <div className={classes.toRight}>
                        {show_hamburger ? <Hamburger {...child_props} /> : <NavList {...child_props} />}
                    </div>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
}