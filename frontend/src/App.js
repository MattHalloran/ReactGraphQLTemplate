import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';
import GalleryPage from './pages/GalleryPage/GalleryPage';
import ShoppingPage from './pages/ShoppingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Snake from './components/Snake/Snake'
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
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenSub);
    PubSub.unsubscribe(this.themeSub);
    PubSub.unsubscribe(this.roleSub);
  }

  render() {
    let currentLocation = this.props.location;
    let isModalOpen = this.modalRoutes.some(route => route === this.props.location.pathname);
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
              <Navbar token={this.state.token} user_roles={this.state.user_roles}/>
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
                <Route exact path="/shopping" render={() => (
                  <ShoppingPage roles={this.state.roles} />
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
