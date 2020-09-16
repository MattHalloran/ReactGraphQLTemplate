import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import logo from './logo.svg';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import HomePage from './components/HomePage/HomePage';
import AboutPage from './components/AboutPage/AboutPage';
import RegisterForm from './components/RegisterForm/RegisterForm';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import Modal from './components/Modal';
//Provide global themes
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme } from './theme';


function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <div className="App">
          <Navbar />
          <RouterWithModal />
        </div>
      </ThemeProvider>
    </Router>
  );
}

// Handles routing. Allows modal popups with their own urls
function RouterWithModal() {
  const [currentTime, setCurrentTime] = useState(0);
  let location = useLocation();
  let background = location.state && location.state.background;
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    })
  }, []);
  return (
    <div>
      <Switch location={background || location}>
        <Route path="/" exact component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/register" render={() =>
          <RegisterForm isSignUp={true} />
        }/>
        <Route path="/login" render={() =>
          <RegisterForm isSignUp={false} />
        }/>
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
