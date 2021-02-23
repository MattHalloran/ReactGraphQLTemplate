import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from 'components/Navbar/Navbar';
import Spinner from 'components/Spinner/Spinner';
import Footer from 'components/Footer/Footer';
import PubSub from 'utils/pubsub';
import { PUBS, LINKS, USER_ROLES } from 'utils/consts';
import { GlobalHotKeys } from "react-hotkeys";
import FormPage from 'pages/FormPage/FormPage';
//Routes
import HomePage from 'pages/HomePage/HomePage';
import AboutPage from 'pages/AboutPage/AboutPage';
import CartPage from 'pages/CartPage/CartPage';
import GalleryPage from 'pages/GalleryPage/GalleryPage';
import ShoppingPage from 'pages/shopping/ShoppingPage/ShoppingPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsPage from 'pages/TermsPage/TermsPage';
import AdminMainPage from 'pages/admin/AdminMainPage/AdminMainPage';
import AdminContactPage from 'pages/admin/AdminContactPage/AdminContactPage';
import AdminCustomerPage from 'pages/admin/AdminCustomerPage/AdminCustomerPage';
import AdminGalleryPage from 'pages/admin/AdminGalleryPage/AdminGalleryPage';
import AdminInventoryPage from 'pages/admin/AdminInventoryPage/AdminInventoryPage';
import AdminOrderPage from 'pages/admin/AdminOrderPage/AdminOrderPage';
import NotFoundPage from 'pages/NotFoundPage/NotFoundPage';
import ProfileForm from 'forms/ProfileForm/ProfileForm';
import SignUpForm from 'forms/SignUpForm/SignUpForm';
import LogInForm from 'forms/LogInForm/LogInForm';
import ForgotPasswordForm from 'forms/ForgotPasswordForm/ForgotPasswordForm';
//Provide global themes
import { GlobalStyles } from './global';
import { getSession, getStatusCodes, getTheme } from './utils/storage';
//Authentication
import RequireAuthentication from 'components/wrappers/RequireAuthentication/RequireAuthentication';
import { checkCookies, getConsts } from 'query/http_promises';

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
    const [statusCodes, setStatusCodes] = useState(null);
    const status_code_attempts = useRef(0);
    const [user_roles, setUserRoles] = useState(null);
    const [theme, setTheme] = useState(getTheme());
    const [menu_open, setMenuOpen] = useState(false);
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
        let statusSub = PubSub.subscribe(PUBS.StatusCodes, (_, o) => setStatusCodes(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o ?? getTheme()));
        let roleSub = PubSub.subscribe(PUBS.Roles, (_, o) => setUserRoles(o));
        let popupSub = PubSub.subscribe(PUBS.PopupOpen, (_, o) => setPopupOpen(open => o === 'toggle' ? !open : o));
        let menuSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, o) => setMenuOpen(open => o === 'toggle' ? !open : o));
        document.addEventListener('scroll', trackScrolling);
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(statusSub);
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(roleSub);
            PubSub.unsubscribe(popupSub);
            PubSub.unsubscribe(menuSub);
            document.removeEventListener('scroll', trackScrolling);
        })
    }, [trackScrolling])

    useEffect(() => {
        if (session == null && session_attempts.current < 5) {
            session_attempts.current++;
            console.log('SESSION UPDATED IN APP', session)
            checkCookies().catch(err => console.error(err));
        }
    }, [session])

    useEffect(() => {
        console.log('STATUS CODE UPDATE',statusCodes)
        if (statusCodes == null && status_code_attempts.current < 5) {
            status_code_attempts.current++;
            getConsts().catch(err => console.log(err));
        }
    }, [statusCodes])

    if (!statusCodes) {
        return (
            <p>WAITING</p>
        );
    }

    return (
        <div id="App">
            <GlobalHotKeys keyMap={keyMap} handlers={handlers} root={true} />
            <GlobalStyles theme={theme} menu_or_popup_open={menu_open || popup_open} />
            <div id="page-container">
                <div id="content-wrap">
                    <Navbar visible={nav_visible} session={session} user_roles={user_roles} />
                    <Spinner spinning={false} />
                    <Switch>
                        {/* public pages */}
                        <Route exact path={LINKS.Home} component={HomePage} />
                        <Route exact path={LINKS.About} component={AboutPage} />
                        <Route exact path={LINKS.PrivacyPolicy} component={PrivacyPolicyPage} />
                        <Route exact path={LINKS.Terms} component={TermsPage} />
                        <Route exact path={`${LINKS.Gallery}/:img?`} component={GalleryPage} />
                        <Route exact path={LINKS.Register} render={() => (
                            <FormPage header="Sign Up" maxWidth="700px">
                                <SignUpForm />
                            </FormPage>
                        )} />
                        <Route exact path={LINKS.LogIn} render={() => (
                            <FormPage header="Log In" maxWidth="700px">
                                <LogInForm />
                            </FormPage>
                        )} />
                        <Route exact path={LINKS.ForgotPassword} render={() => (
                            <FormPage header="Forgot Password" maxWidth="700px">
                                <ForgotPasswordForm />
                            </FormPage>
                        )} />
                        {/* customer pages */}
                        <Route exact path={LINKS.Profile} render={() => (
                            <RequireAuthentication role={USER_ROLES.Customer}>
                                <FormPage header="Profile">
                                    <ProfileForm session={session} />
                                </FormPage>
                            </RequireAuthentication>
                        )} />
                        <Route exact path={`${LINKS.Shopping}/:sku?`} render={() => (
                            <ShoppingPage user_roles={user_roles} session={session} />
                        )} />
                        <Route exact path={LINKS.Cart} render={() => (
                            <CartPage user_roles={user_roles} session={session} />
                        )} />
                        {/* admin pages */}
                        <Route exact path={LINKS.Admin} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminMainPage />
                            </RequireAuthentication>
                        )} />
                        <Route exact path={LINKS.AdminContactInfo} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminContactPage />
                            </RequireAuthentication>
                        )} />
                        <Route exact path={LINKS.AdminCustomers} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminCustomerPage />
                            </RequireAuthentication>
                        )} />
                        <Route exact path={LINKS.AdminGallery} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminGalleryPage />
                            </RequireAuthentication>
                        )} />
                        <Route exact path={LINKS.AdminInventory} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminInventoryPage />
                            </RequireAuthentication>
                        )} />
                        <Route exact path={LINKS.AdminOrders} render={() => (
                            <RequireAuthentication role={USER_ROLES.Admin}>
                                <AdminOrderPage />
                            </RequireAuthentication>
                        )} />
                        {/* 404 page */}
                        <Route component={NotFoundPage} />
                    </Switch>
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default App;
