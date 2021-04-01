import { useState, useRef, useEffect } from 'react';
import Navbar from 'components/Navbar/Navbar';
import IconNav from 'components/IconNav/IconNav';
import Footer from 'components/Footer/Footer';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { GlobalHotKeys } from "react-hotkeys";
import Routes from 'Routes';
import { getSession, getCart, getTheme } from './utils/storage';
import { checkCookies } from 'query/http_promises';
import { CssBaseline, CircularProgress } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';

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
    const [theme, setTheme] = useState(getTheme());
    const [session, setSession] = useState(getSession());
    const session_attempts = useRef(0);
    const [user_roles, setUserRoles] = useState(null);
    const [cart, setCart] = useState(getCart());
    const [popup_open, setPopupOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlers = {
        OPEN_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, true),
        TOGGLE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle'),
        CLOSE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, false),
        CLOSE_POPUP: () => PubSub.publish(PUBS.PopupOpen, false),
        CLOSE_MENU_OR_POPUP: () => {
            if (popup_open) {
                handlers.CLOSE_POPUP();
            } else {
                handlers.CLOSE_MENU();
            }
        },
    };

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(getTheme()));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        let popupSub = PubSub.subscribe(PUBS.PopupOpen, (_, o) => setPopupOpen(open => o === 'toggle' ? !open : o));
        let loadingSub = PubSub.subscribe(PUBS.Loading, (_, data) => setLoading(data));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(roleSub);
            PubSub.unsubscribe(cartSub);
            PubSub.unsubscribe(popupSub);
            PubSub.unsubscribe(loadingSub);
        })
    }, [])

    useEffect(() => {
        if (session == null && session_attempts.current < 5) {
            session_attempts.current++;
            checkCookies().catch(err => console.error(err));
        }
    }, [session])

    return (
        <StyledEngineProvider injectFirst>
            <div id="App">
                <GlobalHotKeys keyMap={keyMap} handlers={handlers} root={true} />
                <CssBaseline />
                {/* Other theming (default TextField variants, button text styling, etc) */}
                <ThemeProvider theme={theme}>
                    <main id="page-container" className={classes.pageContainer}>
                        <div id="content-wrap" className={classes.contentWrap}>
                            <Navbar session={session} user_roles={user_roles} cart={cart} />
                            {loading ? 
                                <div className={classes.spinner}>
                                    <CircularProgress size={100} /> 
                                </div>
                            : null}
                            <Routes session={session} user_roles={user_roles} />
                        </div>
                        <IconNav cart={cart} />
                        <Footer />
                    </main>
                </ThemeProvider>
            </div>
        </StyledEngineProvider>
    );
}

export default App;
