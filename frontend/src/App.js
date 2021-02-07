import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from 'components/shared/Navbar/Navbar';
import Spinner from 'components/shared/Spinner/Spinner';
import Footer from 'components/shared/Footer/Footer';
import PubSub from 'utils/pubsub';
import { PUBS, LINKS, USER_ROLES, LOCAL_STORAGE } from 'consts';
import { GlobalHotKeys } from "react-hotkeys";
import FormPage from 'components/shared/wrappers/FormPage/FormPage';
//Routes
import HomePage from 'components/HomePage/HomePage';
import AboutPage from 'components/AboutPage/AboutPage';
import GalleryPage from 'components/GalleryPage/GalleryPage';
import ShoppingPage from 'components/shopping/ShoppingPage/ShoppingPage';
import PrivacyPolicyPage from 'components/PrivacyPolicyPage/PrivacyPolicyPage';
import AdminMainPage from 'components/admin/AdminMainPage/AdminMainPage';
import AdminContactPage from 'components/admin/AdminContactPage/AdminContactPage';
import AdminCustomerPage from 'components/admin/AdminCustomerPage/AdminCustomerPage';
import AdminGalleryPage from 'components/admin/AdminGalleryPage/AdminGalleryPage';
import AdminInventoryPage from 'components/admin/AdminInventoryPage/AdminInventoryPage';
import AdminOrderPage from 'components/admin/AdminOrderPage/AdminOrderPage';
import NotFoundPage from 'components/NotFoundPage/NotFoundPage/';
import ProfileForm from 'components/forms/ProfileForm/ProfileForm';
import SignUpForm from 'components/forms/SignUpForm/SignUpForm';
import LogInForm from 'components/forms/LogInForm/LogInForm';
import ForgotPasswordForm from 'components/forms/ForgotPasswordForm/ForgotPasswordForm';
//Provide global themes
import { GlobalStyles } from './global';
import { getItem, getTheme } from './storage';
//Authentication
import RequireAuthentication from 'components/shared/wrappers/RequireAuthentication/RequireAuthentication';
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
  const [session, setSession] = useState(getItem(LOCAL_STORAGE.Session));
  const session_attempts = useRef(0);
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
    let sessionSub = PubSub.subscribe(PUBS.Session, (_, s) => setSession(s));
    let themeSub = PubSub.subscribe(PUBS.Theme, (_, t) => setTheme(t ?? getTheme()));
    let roleSub = PubSub.subscribe(PUBS.Roles, (_, r) => setUserRoles(r));
    let popupSub = PubSub.subscribe(PUBS.PopupOpen, (_, p) => setPopupOpen(open => p === 'toggle' ? !open : p));
    let menuSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => setMenuOpen(open => b === 'toggle' ? !open : b));
    document.addEventListener('scroll', trackScrolling);
    return (() => {
      PubSub.unsubscribe(sessionSub);
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
      checkCookies();
    }
  }, [session])

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
                <Route exact path={`${LINKS.Gallery}/:img?`} component={GalleryPage} />
                <Route exact path={LINKS.Register} render={() => (
                  <FormPage header="Sign Up">
                    <SignUpForm />
                  </FormPage>
                )} />
                <Route exact path={LINKS.LogIn} render={() => (
                  <FormPage header="Log In">
                    <LogInForm />
                  </FormPage>
                )} />
                <Route exact path={LINKS.ForgotPassword} render={() => (
                  <FormPage header="Forgot Password">
                    <ForgotPasswordForm />
                  </FormPage>
                )} />
                {/* customer pages */}
                <Route exact path={LINKS.Profile} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Customer}>
                    <FormPage header="Profile">
                      <ProfileForm session={session} />
                    </FormPage>
                  </RequireAuthentication>
                )} />
                <Route exact path={`${LINKS.Shopping}/:sku?`} render={() => (
                  <ShoppingPage user_roles={user_roles} session={session} />
                )} />
                {/* admin pages */}
                <Route exact path={LINKS.Admin} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
                    <AdminMainPage />
                  </RequireAuthentication>
                )} />
                <Route exact path={LINKS.AdminContactInfo} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
                    <AdminContactPage />
                  </RequireAuthentication>
                )} />
                <Route exact path={LINKS.AdminCustomers} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
                    <AdminCustomerPage />
                  </RequireAuthentication>
                )} />
                <Route exact path={LINKS.AdminGallery} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
                    <AdminGalleryPage />
                  </RequireAuthentication>
                )} />
                <Route exact path={LINKS.AdminInventory} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
                    <AdminInventoryPage />
                  </RequireAuthentication>
                )} />
                <Route exact path={LINKS.AdminOrders} render={() => (
                  <RequireAuthentication session={session} role={USER_ROLES.Admin}>
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
