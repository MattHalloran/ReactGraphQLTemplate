import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import GalleryPage, { GalleryImage } from './pages/GalleryPage';
import ShoppingPage from './pages/ShoppingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Snake from './components/Snake/Snake'
import AdminMainPage from './pages/admin/AdminMainPage';
import AdminContactPage from './pages/admin/AdminContactPage';
import AdminCustomerPage from './pages/admin/AdminCustomerPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';
import AdminPlantPage from './pages/admin/AdminPlantPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import Modal from './components/Modal';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import PubSub from './utils/pubsub';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { getTheme } from './theme';
//Authentication
import { requireAuthentication } from './components/AuthenticatedComponent';
import * as authQuery from './query/auth';
import SignUpForm from './components/Forms/SignUpForm';
import LogInForm from './components/Forms/LogInForm';
import ForgotPasswordForm from './components/Forms/ForgotPasswordForm';

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
    }
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
    if (distance_scrolled > 50 && this.state.nav_visible) {
      this.setState({ nav_visible: false });
    } else if (distance_scrolled <= -50 && !this.state.nav_visible) {
      this.setState({ nav_visible: true });
    }
  };

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
        <GlobalStyles />
        <div className="App">
          <div className="page-container">
            <div className="content-wrap">
              <Navbar visible={this.state.nav_visible} token={this.state.token} user_roles={this.state.user_roles}/>
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
                  <Route exact path="/register" children={<Modal
                  history={this.props.history}>
                  <SignUpForm history={this.props.history} />
                </Modal>} />
                <Route exact path="/login" children={<Modal
                  history={this.props.history}>
                  <LogInForm history={this.props.history} />
                </Modal>} />
                <Route exact path="/forgot-password" children={<Modal
                  history={this.props.history}>
                  <ForgotPasswordForm history={this.props.history} />
                </Modal>} />
                <Route path="/gallery/:id" children={<Modal
                  history={this.props.history}>
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
