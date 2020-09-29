import React, { useRef } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
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
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme } from './theme';
//Provide user context
import UserContext from './contexts/UserContext';
import * as actionCreators from './actions/auth';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        email: null,
        token: null,
      }
    }
  }

  componentDidMount() {
    actionCreators.checkJWT().then(res => {
      this.setState({
        user: {
          "email": res.email,
          "token": res.token
        }
      })
    }).catch(() => {
      this.setState({ user: {
        "email": null,
        "token": null
      } })
    })
  }

  render() {
    return (
      <Router>
        <UserContext.Provider value={this.state.user}>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <div className="App">
              <div className="page-container">
                <div className="content-wrap">
                  <Navbar />
                  <Spinner spinning={false} />
                  <RouterWithModal />
                </div>
                <Footer />
              </div>
            </div>
          </ThemeProvider>
        </UserContext.Provider>
      </Router>
    );
  }
}

// Handles routing. Allows modal popups with their own urls
function RouterWithModal() {
  let location = useLocation();
  let background = location.state && location.state.background;
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  return (
    <div>
      <Switch location={background || location}>
        <Route path="/" exact component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/profile" component={requireAuthentication(ProfilePage)} />
        <Route path="/register" render={() =>
          <RegisterForm isSignUp={true} />
        } />
        <Route path="/login" render={() =>
          <RegisterForm isSignUp={false} />
        } />
        <Route component={NotFoundPage} />
      </Switch>
      {background && <Route path="/register" children={<Modal
        modalRef={modalRef}
        buttonRef={buttonRef}>
        <RegisterForm isSignUp={true} />
      </Modal>} />}
      {background && <Route path="/login" children={<Modal
        modalRef={modalRef}
        buttonRef={buttonRef}>
        <RegisterForm isSignUp={false} />
      </Modal>} />}
    </div>
  );
}

export default App;
