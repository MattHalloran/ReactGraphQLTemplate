import { useState, useEffect, useCallback, useRef } from 'react';
import {
    AlertDialog,
    BottomNav,
    Footer,
    Navbar,
    Snack
} from 'components';
import PubSub from 'pubsub-js';
import { PUBS, themes } from 'utils';
import { Routes } from 'Routes';
import { CssBaseline, CircularProgress } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useMutation, useQuery } from '@apollo/client';
import { readAssetsQuery } from 'graphql/query/readAssets';
import { loginMutation } from 'graphql/mutation';
import Lato from 'assets/fonts/Lato.woff2';
import { Business, Cart, UserRoles } from 'types';
import { readAssets, readAssetsVariables } from 'graphql/generated/readAssets';
import { login } from 'graphql/generated/login';
import hotkeys from 'hotkeys-js';

const useStyles = makeStyles(() => ({
    "@global": {
        body: {
            backgroundColor: 'black',
        },
        '#page': {
            minWidth: '100%',
            minHeight: '100%',
            padding: '1em',
            paddingTop: 'calc(14vh + 20px)'
        },
        '@media (min-width:500px)': {
            '#page': {
                paddingLeft: 'max(1em, calc(15% - 75px))',
                paddingRight: 'max(1em, calc(15% - 75px))',
            }
        },
        '@font-face': {
            fontFamily: 'Lato',
            src: `local('Lato'), url(${Lato}) format('truetype')`,
            fontDisplay: 'swap',
        }
    },
    contentWrap: {
        minHeight: '100vh',
    },
    spinner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100000,
    },
}));

export function App() {
    const classes = useStyles();
    // Session cookie should automatically expire in time determined by server,
    // so no need to validate session on first load
    const [session, setSession] = useState<any>(null);
    const [theme, setTheme] = useState(themes.light);
    const [cart, setCart] = useState<Cart>(null);
    const [roles, setRoles] = useState<UserRoles>(null);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [business, setBusiness] = useState<Business>(null)
    const { data: businessData } = useQuery<readAssets, readAssetsVariables>(readAssetsQuery, { variables: { files: ['hours.md', 'business.json'] } });
    const [login] = useMutation<login>(loginMutation);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLoading(false);

        const handlers = {
            OPEN_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, true),
            TOGGLE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle'),
            CLOSE_MENU: () => PubSub.publish(PUBS.BurgerMenuOpen, false),
            CLOSE_MENU_OR_POPUP: () => {
                handlers.CLOSE_MENU();
            }
        }
        hotkeys('left', handlers.OPEN_MENU);
        hotkeys('right', handlers.CLOSE_MENU);
        hotkeys('m', handlers.TOGGLE_MENU);
        hotkeys('escape,backspace', handlers.CLOSE_MENU_OR_POPUP);
    }, []);

    useEffect(() => {
        if (businessData === undefined) return;
        let data = businessData.readAssets[1] ? JSON.parse(businessData.readAssets[1]) : {};
        let hoursRaw = businessData.readAssets[0];
        data.hours = hoursRaw;
        setBusiness(data);
    }, [businessData])

    useEffect(() => {
        // Determine theme
        if (session?.theme) setTheme(themes[session?.theme])
        else if (session && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(themes.dark);
        else setTheme(themes.light);
        setCart(session?.cart ?? null);
        setRoles(session?.roles ? session.roles.map(r => r.role) : null);
    }, [session])

    const checkLogin = useCallback((session?: any) => {
        if (session) {
            setSession(session);
            return;
        }
        login().then((response) => {
            setSession(response?.data?.login);
        }).catch((response) => {
            if (process.env.NODE_ENV === 'development') console.error('Error: cannot login', response);
            setSession({})
        })
    }, [login])

    useEffect(() => {
        checkLogin();
        // Handle loading spinner, which can have a delay
        let loadingSub = PubSub.subscribe(PUBS.Loading, (_, data) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (Number.isInteger(data)) {
                timeoutRef.current = setTimeout(() => setLoading(true), Math.abs(data));
            } else {
                setLoading(Boolean(data));
            }
        });
        let businessSub = PubSub.subscribe(PUBS.Business, (_, data) => setBusiness(data));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, data) => setTheme(themes[data] ?? themes.light));
        return (() => {
            PubSub.unsubscribe(loadingSub);
            PubSub.unsubscribe(businessSub);
            PubSub.unsubscribe(themeSub);
        })
    }, [checkLogin])

    return (
        <StyledEngineProvider injectFirst>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <DndProvider backend={HTML5Backend}>
                    <div id="App">
                        <main
                            id="page-container"
                            style={{
                                background: theme.palette.background.default,
                                color: theme.palette.background.textPrimary,
                            }}
                        >
                            <div id="content-wrap" className={classes.contentWrap}>
                                <Navbar
                                    business={business}
                                    userRoles={roles}
                                    cart={cart}
                                />
                                {loading ?
                                    <div className={classes.spinner}>
                                        <CircularProgress size={100} />
                                    </div>
                                    : null}
                                <AlertDialog />
                                <Snack />
                                <Routes
                                    sessionChecked={session !== null && session !== undefined}
                                    onSessionUpdate={checkLogin}
                                    business={business}
                                    userRoles={roles}
                                    cart={cart}
                                />
                            </div>
                            <BottomNav userRoles={roles} cart={cart} />
                            <Footer userRoles={roles} business={business} />
                        </main>
                    </div>
                </DndProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
