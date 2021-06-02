import { useState, useEffect } from 'react';
import {
    AlertDialog,
    Footer,
    IconNav,
    Navbar,
    Snack
} from 'components';
import { PUBS, PubSub, lightTheme, darkTheme } from 'utils';
import { GlobalHotKeys } from "react-hotkeys";
import { Routes } from 'Routes';
import { CssBaseline, CircularProgress } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
    "@global": {
        body: {
            backgroundColor: 'black',
        },
        '#page': {
            minWidth: '100%',
            minHeight: '100%',
            padding: '1em',
            paddingTop: 'calc(14vh + 20px)',
        }
    },
    pageContainer: {
        background: theme.palette.background.default,
    },
    contentWrap: {
        minHeight: '100vh',
    },
    spinner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '100000',
    },
}));

const keyMap = {
    OPEN_MENU: "left",
    TOGGLE_MENU: "m",
    CLOSE_MENU: "right",
    CLOSE_MENU_OR_POPUP: ["escape", "backspace"]
};

export function App() {
    const classes = useStyles();
    // Session cookie should automatically expire in time determined by backend,
    // so no need to validate session on first load
    const [session, setSession] = useState(null);
    const [theme, setTheme] = useState(lightTheme);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    let history = useHistory();

    useEffect(() => {
        console.log('SESSION UPDATED!!!!!!!', session);
        setTheme(session?.theme === 'dark' ? darkTheme : lightTheme);
        setCart(session?.orders?.length > 0 ? session.orders[session.orders.length - 1] : null);
    }, [session])

    const handlers = {
        OPEN_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, true),
        TOGGLE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle'),
        CLOSE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, false),
        CLOSE_MENU_OR_POPUP: () => {
            handlers.CLOSE_MENU();
        },
    };

    useEffect(() => {
        let loadingSub = PubSub.subscribe(PUBS.Loading, (_, data) => setLoading(data));
        return (() => {
            PubSub.unsubscribe(loadingSub);
        })
    }, [])

    const redirect = (link) => history.push(link);

    return (
        <StyledEngineProvider injectFirst>
            <div id="App">
                <GlobalHotKeys keyMap={keyMap} handlers={handlers} root={true} />
                <CssBaseline />
                {/* Other theming (default TextField variants, button text styling, etc) */}
                <ThemeProvider theme={theme}>
                    <main id="page-container" className={classes.pageContainer}>
                        <div id="content-wrap" className={classes.contentWrap}>
                            <Navbar
                                session={session}
                                onSessionUpdate={setSession}
                                roles={session?.roles}
                                cart={cart}
                                onRedirect={redirect}
                            />
                            {loading ?
                                <div className={classes.spinner}>
                                    <CircularProgress size={100} />
                                </div>
                                : null}
                            <AlertDialog />
                            <Snack />
                            <Routes
                                session={session}
                                onSessionUpdate={setSession}
                                roles={session?.roles}
                                cart={cart}
                                onRedirect={redirect}
                            />
                        </div>
                        <IconNav session={session} roles={session?.roles} cart={cart} />
                        <Footer session={session} />
                    </main>
                </ThemeProvider>
            </div>
        </StyledEngineProvider>
    );
}
