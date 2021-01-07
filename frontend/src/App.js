import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Modal from './components/shared/Modal';
import Spinner from './components/shared/Spinner';
import Footer from './components/shared/Footer';
import PubSub from './utils/pubsub';
//Routes
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import GalleryPage, { GalleryImage } from './components/GalleryPage';
import ShoppingPage from './components/shopping/ShoppingPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import AdminMainPage from './components/admin/AdminMainPage';
import AdminContactPage from './components/admin/AdminContactPage';
import AdminCustomerPage from './components/admin/AdminCustomerPage';
import AdminGalleryPage from './components/admin/AdminGalleryPage';
import AdminInventoryPage from './components/admin/AdminInventoryPage';
import AdminOrderPage from './components/admin/AdminOrderPage';
import AdminPlantPage from './components/admin/AdminPlantPage';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import ProfilePage from './components/ProfilePage';
import SignUpForm from './components/forms/SignUpForm';
import LogInForm from './components/forms/LogInForm';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { getTheme } from './theme';
//Authentication
import { requireAuthentication } from './components/shared/hoc/requireAuthentication';
import * as authQuery from './query/auth';

function App(props) {
  let [non_modal_location, setNonModalLocation] = useState(null);
  let [nav_visible, setNavVisible] = useState(true);
  const nav_visible_y = useRef(-1);
  let [token, setToken] = useState(null);
  let [user_roles, setUserRoles] = useState(null);
  let [theme, setTheme] = useState(getTheme());
  let [menu_open, setMenuOpen] = useState(false);

  let modalRoutes = ['/register', '/login', '/forgot-password', '/gallery/'];
  let isModalOpen = modalRoutes.some(route => window.location.pathname.includes(route));
  if (!isModalOpen && non_modal_location === null) {
    setNonModalLocation(window.location);
  }
  console.log('EEEEEEEEE')

  // Determines when the nav becomes visible/invisible
  const trackScrolling = useCallback(() => {
    console.log('DDDDDDDDD')
    if (nav_visible_y === -1) nav_visible_y.current = window.pageYOffset;
    let distance_scrolled = window.pageYOffset - nav_visible_y;
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
    console.log('AAAAAAAAAAA')
    let tokenSub = PubSub.subscribe('token', (_, t) => setToken(t));
    let themeSub = PubSub.subscribe('theme', (_, t) => setTheme(t));
    let roleSub = PubSub.subscribe('roles', (_, r) => setUserRoles(r));
    document.addEventListener('scroll', trackScrolling);
    return (() => {
      console.log('BBBBBBBB')
      PubSub.unsubscribe(tokenSub);
      PubSub.unsubscribe(themeSub);
      PubSub.unsubscribe(roleSub);
      document.removeEventListener('scroll', trackScrolling);
    })
  }, [trackScrolling])

  useEffect(() => {
    console.log('CCCCCCCCC')
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
            {non_modal_location === null ?
              <Switch>
                <Route path="/" component={HomePage} />
              </Switch>
              :
              <Switch location={non_modal_location}>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/privacy-policy" component={PrivacyPolicyPage} />
                <Route exact path="/gallery" component={GalleryPage} />
                <Route exact path="/profile/:edit?" component={requireAuthentication(ProfilePage, token)} />
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
                <Route component={NotFoundPage} />
              </Switch>
            }
            {/* Modal routes - will display above previous route, or homepage */}
            {isModalOpen ?
              <Switch>
                <Route exact path="/register" children={<Modal>
                  <SignUpForm />
                </Modal>} />
                <Route exact path="/login" children={<Modal>
                  <LogInForm />
                </Modal>} />
                <Route exact path="/forgot-password" children={<Modal>
                  <ForgotPasswordForm />
                </Modal>} />
                <Route path="/gallery/:img" children={<Modal>
                  <GalleryImage {...props} />
                </Modal>} />
              </Switch>
              : null}
          </div>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
