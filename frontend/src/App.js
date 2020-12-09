import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import HomePage from './components/Pages/HomePage/HomePage';
import AboutPage from './components/Pages/AboutPage/AboutPage';
import PrivacyPolicyPage from './components/Pages/PrivacyPolicyPage';
import Snake from './components/Snake/Snake'
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import { requireAuthentication } from './components/AuthenticatedComponent';
import ProfilePage from './components/Pages/ProfilePage';
import Modal from './components/Modal';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import PubSub from './utils/pubsub';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { getTheme, lightTheme } from './theme';
//Provide user context
import * as actionCreators from './actions/auth';
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
      user: {
        token: null,
        theme: null,
        name: null
      },
      theme: lightTheme,
    }
  }

  componentDidMount() {
    //If a user has logged in, update the global user prop
    this.userSub = PubSub.subscribe('User', (_, data) => {
      if (this.state.user !== data) {
        this.setState({ user: data })
      }
    });

    this.setState({theme: getTheme()});
    this.themeSub = PubSub.subscribe('Theme', (_, data) => {
      this.setState({theme: data});
    });

    if (this.state.user.token == null) {
      actionCreators.checkJWT();
    }
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
              <Navbar user={this.state.user} />
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
                <Route exact path="/profile" component={requireAuthentication(ProfilePage, this.state.user)} />
                <Route exact path="/smile" component={Snake} />
                <Route component={NotFoundPage} />
              </Switch>
              }
              {/* Modal routes - will display above previous route, or homepage */}
              {isModalOpen ? 
                <Switch>
                  <Route exact path="/register" children={<Modal
                  history={this.props.history}>
                  <SignUpForm />
                </Modal>} />
                <Route exact path="/login" children={<Modal
                  history={this.props.history}>
                  <LogInForm />
                </Modal>} />
                <Route exact path="/forgot-password" children={<Modal
                  history={this.props.history}>
                  <ForgotPasswordForm />
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
