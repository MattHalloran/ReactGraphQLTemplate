import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import HomePage from './components/HomePage/HomePage';
import AboutPage from './components/AboutPage/AboutPage';
import RegisterForm from './components/RegisterForm/RegisterForm';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import { requireAuthentication } from './components/AuthenticatedComponent';
import ProfilePage from './components/ProfilePage';
import Modal from './components/Modal';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import PubSub from './utils/pubsub';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme } from './theme';
//Provide user context
import * as actionCreators from './actions/auth';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.previousLocation = this.props.Location;
    this.modalRef = React.createRef(null);
    this.buttonRef = React.createRef(null);
    this.state = {
      user: {
        email: null,
        token: null,
      }
    }
  }

  componentDidMount() {
    //If a user has logged in, update the global user prop
    this.userSub = PubSub.subscribe('User', (_, data) => {
      if (this.state.user != data) {
        this.setState({ user: data })
      }
    });

    if (this.state.user.token == null) {
      actionCreators.checkJWT();
    }
  }

  componentWillUpdate() {
    let { location } = this.props;
    if (!(location.state && location.state.modal) && 
        this.previousLocation != location) {
      this.previousLocation = location;
    }
  }

  render() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    );

    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <div className="App">
          <div className="page-container">
            <div className="content-wrap">
              <Navbar user={this.state.user} />
              <Spinner spinning={false} />
              <Switch location={isModal ? this.previousLocation : location}>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/about" component={AboutPage} />
                <Route exact path="/profile" component={requireAuthentication(ProfilePage, this.state.user)} />
                <Route exact path="/register" children={<Modal
                  modalRef={this.modalRef}
                  buttonRef={this.buttonRef}>
                  <RegisterForm isSignUp={true} />
                </Modal>} />
                <Route exact path="/login" children={<Modal
                  modalRef={this.modalRef}
                  buttonRef={this.buttonRef}>
                  <RegisterForm isSignUp={false} />
                </Modal>} />
                <Route component={NotFoundPage} />
              </Switch>
              {isModal
                ? <Route exact path="/register" children={<Modal
                  modalRef={this.modalRef}
                  buttonRef={this.buttonRef}>
                  <RegisterForm isSignUp={true} />
                </Modal>} />
                : null
              }
              {isModal
                ? <Route exact path="/login" children={<Modal
                  modalRef={this.modalRef}
                  buttonRef={this.buttonRef}>
                  <RegisterForm isSignUp={false} />
                </Modal>} />
                : null
              }
            </div>
            <Footer />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default withRouter(App);
