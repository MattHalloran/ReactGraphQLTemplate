import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from 'components/Navbar/Navbar';
import Spinner from 'components/Spinner/Spinner';
import Footer from 'components/Footer/Footer';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { GlobalHotKeys } from "react-hotkeys";
import Routes from 'Routes';
import { GlobalStyles } from './global';
import { getSession, getTheme, getCart } from './utils/storage';
import { checkCookies } from 'query/http_promises';

const keyMap = {
    OPEN_MENU: "left",
    TOGGLE_MENU: "m",
    CLOSE_MENU: "right",
    CLOSE_MENU_OR_POPUP: ["escape", "backspace"]
};

function App() {
    const [nav_visible, setNavVisible] = useState(true);
    const nav_visible_y = useRef(-1);
    const [session, setSession] = useState(getSession());
    const session_attempts = useRef(0);
    const [user_roles, setUserRoles] = useState(null);
    const [cart, setCart] = useState(getCart());
    const [theme, setTheme] = useState(getTheme());
    const [menu_open, setMenuOpen] = useState(false);
    const [arrow_open, setArrowOpen] = useState(false);
    const [popup_open, setPopupOpen] = useState(false);

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

    // Determines when the nav becomes visible/invisible
    const trackScrolling = useCallback(() => {
        if (nav_visible_y === -1) nav_visible_y.current = window.pageYOffset;
        let distance_scrolled = window.pageYOffset - nav_visible_y.current;
        if ((distance_scrolled > 0 && !nav_visible) ||
            (distance_scrolled < 0 && nav_visible)) {
            nav_visible_y.current = window.pageYOffset;
        }
        if (distance_scrolled > 50 && nav_visible && window.pageYOffset > 100) {
            setNavVisible(false);
        } else if (distance_scrolled <= -50 && !nav_visible) {
            setNavVisible(true);
        }
    }, [nav_visible]);

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o ?? getTheme()));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        let popupSub = PubSub.subscribe(PUBS.PopupOpen, (_, o) => setPopupOpen(open => o === 'toggle' ? !open : o));
        let arrowSub = PubSub.subscribe(PUBS.ArrowMenuOpen, (_, o) => setArrowOpen(open => o === 'toggle' ? !open : o));
        let menuSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, o) => setMenuOpen(open => o === 'toggle' ? !open : o));
        document.addEventListener('scroll', trackScrolling);
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(roleSub);
            PubSub.unsubscribe(cartSub);
            PubSub.unsubscribe(popupSub);
            PubSub.unsubscribe(arrowSub);
            PubSub.unsubscribe(menuSub);
            document.removeEventListener('scroll', trackScrolling);
        })
    }, [trackScrolling])

    useEffect(() => {
        if (session == null && session_attempts.current < 5) {
            session_attempts.current++;
            checkCookies().catch(err => console.error(err));
        }
    }, [session])

    return (
        <div id="App">
            <GlobalHotKeys keyMap={keyMap} handlers={handlers} root={true} />
            <GlobalStyles theme={theme} menu_or_popup_open={menu_open || arrow_open || popup_open} />
            <div id="page-container">
                <div id="content-wrap">
                    <Navbar visible={nav_visible} session={session} user_roles={user_roles} cart={cart} />
                    <Spinner spinning={false} />
                    <Routes session={session} user_roles={user_roles}/>
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default App;
