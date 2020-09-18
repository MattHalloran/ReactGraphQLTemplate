import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Burger, Menu } from '../../components';
import './Navbar.css';

const SHOW_HAMBURGER_AT = 750;

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.onSignUpSubmit = this.onSignUpSubmit.bind(this);
        this.onLogInSubmit = this.onLogInSubmit.bind(this);
        this.state = {
            signUp: this.props.signUp,
            onSubmit: this.props.onSubmit,
            showHamburger: false,
        }
    }
    onSignUpSubmit = (event) => {
        event.preventDefault(event);
    }
    onLogInSubmit = (event) => {
        event.preventDefault(event);
    }
    //Lifecycle methods
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ showHamburger: window.innerWidth <= SHOW_HAMBURGER_AT });
    }
    //End lifecycle methods
    render() {
        let menu;
        if (this.state.showHamburger) {
            menu = <Hamburger />
        } else {
            menu = <NavList onSignUpSubmit={this.onSignUpSubmit} onLogInSubmit={this.onLogInSubmit} />
        }
        return (
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top" >
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        New Life Nursery
                </Link>
                    {menu}
                </div>
            </nav>
        );
    }
}

class Hamburger extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.state = {
            open: false,
        }
    }
    toggleOpen = () => {
        this.setState({ open: !this.state.open });
    }
    render() {
        return (
            <React.Fragment>
                <div>
                    <Burger className="align-right" open={this.state.open} toggleOpen={this.toggleOpen} />
                    <Menu open={this.state.open} closeMenu={() => this.setState({ open: false })} />
                </div>
            </React.Fragment>
        );
    }
}

function NavList(props) {
    let location = useLocation();
    return (
        <React.Fragment>
            <div>
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link className="nav-link" 
                            to={{pathname:"/info",
                            state:{background:location}}}>Info</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" 
                            to={{pathname:"/register",
                            state:{background:location}}}>Sign Up</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" 
                            to={{pathname:"/login",
                            state:{background:location}}}>Log In</Link>
                    </li>
                </ul>
            </div>
        </React.Fragment>
    );
}

export default Navbar;