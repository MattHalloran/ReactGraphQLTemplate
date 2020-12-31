import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import GalleryPage, { GalleryImage } from './components/GalleryPage';
import ShoppingPage from './components/shopping/ShoppingPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import Snake from './components/shared/Snake/Snake'
import AdminMainPage from './components/admin/AdminMainPage';
import AdminContactPage from './components/admin/AdminContactPage';
import AdminCustomerPage from './components/admin/AdminCustomerPage';
import AdminGalleryPage from './components/admin/AdminGalleryPage';
import AdminInventoryPage from './components/admin/AdminInventoryPage';
import AdminOrderPage from './components/admin/AdminOrderPage';
import AdminPlantPage from './components/admin/AdminPlantPage';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import ProfilePage from './components/ProfilePage';
import Modal from './components/shared/Modal';
import Spinner from './components/shared/Spinner';
import Footer from './components/shared/Footer';
import PubSub from './utils/pubsub';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { getTheme } from './theme';
//Authentication
import { requireAuthentication } from './components/shared/hoc/requireAuthentication';
import * as authQuery from './query/auth';
import SignUpForm from './components/forms/SignUpForm';
import LogInForm from './components/forms/LogInForm';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.previousLocation = this.props.Location;
    this.modalRef = React.createRef(null);
    this.buttonRef = React.createRef(null);
    this.modalRoutes = ['/register', '/login', '/forgot-password']
    this.isModalOpen = false;
    this.state = {
      nav_visible: true,
      token: null,
      user_roles: null,
      theme: getTheme(),
      menu_open: false,
    }
    this.menuClicked = this.menuClicked.bind(this);
  }

  componentDidMount() {
    this.tokenSub = PubSub.subscribe('token', (_, token) => {
      if (this.state.token !== token) {
        this.setState({ token: token });
      }
    });
    this.themeSub = PubSub.subscribe('theme', (_, theme) => {
      if (this.state.theme !== theme) {
        this.setState({ theme: theme });
      }
    });
    this.roleSub = PubSub.subscribe('roles', (_, roles) => {
      if (this.state.user_roles !== roles) {
        this.setState({ user_roles: roles });
      }
    });

    if (this.state.token == null) {
      authQuery.checkCookies();
    }
    //Tracks when nav became visible or invisible
    this.nav_visible_y = window.pageYOffset;
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenSub);
    PubSub.unsubscribe(this.themeSub);
    PubSub.unsubscribe(this.roleSub);
    document.addEventListener('scroll', this.trackScrolling);
  }

  // Determines when to load the next page of thumbnails
  trackScrolling = () => {
    let distance_scrolled = window.pageYOffset - this.nav_visible_y;
    if (distance_scrolled > 0 && !this.state.nav_visible ||
        distance_scrolled < 0 && this.state.nav_visible) {
      this.nav_visible_y = window.pageYOffset;
    }
    if (distance_scrolled > 50 && this.state.nav_visible && window.pageYOffset > 100) {
      this.setState({ nav_visible: false });
    } else if (distance_scrolled <= -50 && !this.state.nav_visible) {
      this.setState({ nav_visible: true });
    }
  };

  menuClicked(is_open) {
    console.log("MENU CLICKEEDDD!!!!", is_open);
    this.setState({ menu_open: is_open });
  }

  render() {
    let currentLocation = this.props.location;
    let isModalOpen = this.modalRoutes.some(route => route === this.props.location.pathname) || this.props.location.pathname.includes('/gallery/'); //TODO make better check for gallery image modal
    if (!isModalOpen) {
      this.previousLocation = this.props.location;
    } else {
      currentLocation = this.previousLocation;
    }
    // Happens when first navigated page is a modal
    let loadDefaultPage = (currentLocation === undefined);
    
    return (
      <ThemeProvider theme={this.state.theme}>
        <GlobalStyles menu_open={this.state.menu_open}/>
        <div className="App">
          <div className="page-container">
            <div className="content-wrap">
              <Navbar menuClicked={this.menuClicked} history={this.props.history} visible={this.state.nav_visible} token={this.state.token} user_roles={this.state.user_roles}/>
              <Spinner spinning={false} />
              {/* Non-modal routes - only one can be loaded at a time */}
              {loadDefaultPage ? 
              <Switch>
                <Route path="/" component={HomePage} />
              </Switch>
              :
              <Switch location={currentLocation}>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/privacy-policy" component={PrivacyPolicyPage} />
                <Route exact path="/gallery" component={GalleryPage} />
                <Route exact path="/profile" component={requireAuthentication(ProfilePage, this.state.token)} />
                <Route exact path="/admin" component={AdminMainPage} />
                <Route exact path="/admin/contact-info" component={AdminContactPage} />
                <Route exact path="/admin/customers" component={AdminCustomerPage} />
                <Route exact path="/admin/gallery" component={AdminGalleryPage} />
                <Route exact path="/admin/inventory" component={AdminInventoryPage} />
                <Route exact path="/admin/orders" component={AdminOrderPage} />
                <Route exact path="/admin/plant-info" component={AdminPlantPage} />
                <Route exact path="/shopping" render={() => (
                  <ShoppingPage user_roles={this.state.user_roles} />
                )} />
                <Route exact path="/smile" component={Snake} />
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
                <Route path="/gallery/:id" children={<Modal>
                    <GalleryImage {...this.props} />
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
}

export default withRouter(App);
