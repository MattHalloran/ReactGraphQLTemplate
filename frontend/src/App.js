import { useState, useEffect } from 'react';
import {
    AlertDialog,
    Footer,
    IconNav,
    Navbar,
    Snack
} from 'components';
import PubSub from 'utils/pubsub';
import { PUBS, COOKIE, SESSION_DAYS } from 'utils/consts';
import Cookies from 'js-cookie';
import { GlobalHotKeys } from "react-hotkeys";
import Routes from 'Routes';
import { lightTheme, darkTheme } from 'utils/theme';
import { useGet } from "restful-react";
import { RestfulProvider } from "restful-react";
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

function App() {
    const classes = useStyles();
    const [session, setSession] = useState(() => {
        try {
            return JSON.parse(Cookies.get(COOKIE.Session));
        } catch {
            Cookies.set(COOKIE.Session, null);
            return null;
        }
    });
    const [sessionFailed, setSessionFailed] = useState(session === null);
    const [theme, setTheme] = useState(lightTheme);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    let history = useHistory();

    useEffect(() => {
        console.log('SESSION UPDATED!!!!!!!')
        console.log(session);
        if (session !== null) {
            Cookies.set(COOKIE.Session, JSON.stringify(session), { expires: SESSION_DAYS })
            setTheme(session?.theme === 'dark' ? darkTheme : lightTheme);
            setCart(session?.orders?.length > 0 ? session.orders[session.orders.length-1] : null);
        } else {
            Cookies.set(COOKIE.Session, null);
        }
    }, [session])

    useGet({
        path: 'http://localhost:5000/api/v1/validate_session',
        lazy: sessionFailed,
        queryParams: { session: { tag: session?.tag, token: session?.token } },
        resolve: (response) => {
            setSession(response.session);
            setSessionFailed(!response.ok);
        }
    }, [])

    const handlers = {
        OPEN_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, true),
        TOGGLE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle'),
        CLOSE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, false),
        CLOSE_MENU_OR_POPUP: () => {
            handlers.CLOSE_MENU();
        },
    };

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let loadingSub = PubSub.subscribe(PUBS.Loading, (_, data) => setLoading(data));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(loadingSub);
        })
    }, [])

    return (
        <RestfulProvider 
            base="http://localhost:5000/api/v1/" 
            requestOptions={() => ({ headers: { session: { tag: session?.tag, token: session?.token } } })}>
            <StyledEngineProvider injectFirst>
                <div id="App">
                    <GlobalHotKeys keyMap={keyMap} handlers={handlers} root={true} />
                    <CssBaseline />
                    {/* Other theming (default TextField variants, button text styling, etc) */}
                    <ThemeProvider theme={theme}>
                        <main id="page-container" className={classes.pageContainer}>
                            <div id="content-wrap" className={classes.contentWrap}>
                                <Navbar session={session} roles={session?.roles} cart={cart} />
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
                                    sessionFailed={sessionFailed} 
                                    roles={session?.roles} 
                                    cart={cart} 
                                    onRedirect={(link) => history.push(link)}
                                />
                            </div>
                            <IconNav session={session} roles={session?.roles} cart={cart} />
                            <Footer session={session} />
                        </main>
                    </ThemeProvider>
                </div>
            </StyledEngineProvider>
        </RestfulProvider>
    );
}

export default App;
