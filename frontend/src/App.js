import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from 'components/shared/Navbar/Navbar';
import Spinner from 'components/shared/Spinner/Spinner';
import Footer from 'components/shared/Footer/Footer';
import PubSub from 'utils/pubsub';
import { formPage } from 'components/shared/hoc/FormPage/formPage';
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
import AdminPlantPage from 'components/admin/AdminPlantPage/AdminPlantPage';
import NotFoundPage from 'components/NotFoundPage/NotFoundPage/';
import ProfilePage from 'components/forms/ProfilePage/ProfilePage';
import SignUpForm from 'components/forms/SignUpForm/SignUpForm';
import LogInForm from 'components/forms/LogInForm/LogInForm';
import ForgotPasswordForm from 'components/forms/ForgotPasswordForm/ForgotPasswordForm';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { getTheme } from './theme';
//Authentication
import { requireAuthentication } from 'components/shared/hoc/RequireAuthentication/requireAuthentication';
import * as authQuery from 'query/auth';

function App(props) {
  let [nav_visible, setNavVisible] = useState(true);
  const nav_visible_y = useRef(-1);
  let [token, setToken] = useState(null);
  let [user_roles, setUserRoles] = useState(null);
  let [theme, setTheme] = useState(getTheme());
  let [menu_open, setMenuOpen] = useState(false);


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

  const menuClicked = (is_open) => setMenuOpen(is_open);

  useEffect(() => {
    let tokenSub = PubSub.subscribe('token', (_, t) => setToken(t));
    let themeSub = PubSub.subscribe('theme', (_, t) => setTheme(t));
    let roleSub = PubSub.subscribe('roles', (_, r) => setUserRoles(r));
    document.addEventListener('scroll', trackScrolling);
    return (() => {
      PubSub.unsubscribe(tokenSub);
      PubSub.unsubscribe(themeSub);
      PubSub.unsubscribe(roleSub);
      document.removeEventListener('scroll', trackScrolling);
    })
  }, [trackScrolling])

  useEffect(() => {
    if (token == null) authQuery.checkCookies();
  }, [token])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles menu_open={menu_open} />
      <div className="App">
        <div className="page-container">
          <div className="content-wrap">
            <Navbar menuClicked={menuClicked} visible={nav_visible} token={token} user_roles={user_roles} />
            <Spinner spinning={false} />
            {/* Non-modal routes - only one can be loaded at a time */}
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/privacy-policy" component={PrivacyPolicyPage} />
                <Route exact path="/gallery" component={GalleryPage} />
                <Route exact path="/admin" component={AdminMainPage} />
                <Route exact path="/admin/contact-info" component={AdminContactPage} />
                <Route exact path="/admin/customers" component={AdminCustomerPage} />
                <Route exact path="/admin/gallery" component={AdminGalleryPage} />
                <Route exact path="/admin/inventory" component={AdminInventoryPage} />
                <Route exact path="/admin/orders" component={AdminOrderPage} />
                <Route exact path="/admin/plant-info" component={AdminPlantPage} />
                <Route exact path="/shopping" render={() => (
                  <ShoppingPage user_roles={user_roles} />
                )} />
                <Route exact path="/register" component={formPage(SignUpForm)} />
                <Route exact path="/login" component={formPage(LogInForm)} />
                <Route exact path="/forgot-password" component={formPage(ForgotPasswordForm)} />
                <Route exact path="/profile/:edit?" component={formPage(requireAuthentication(ProfilePage, token))} />
                <Route component={NotFoundPage} />
              </Switch>
          </div>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
