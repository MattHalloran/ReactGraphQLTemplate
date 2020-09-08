import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import Navbar from './components/Navbar';
import './App.css';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import SignUpPage from './components/SignUpPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/signup" component={SignUpPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
