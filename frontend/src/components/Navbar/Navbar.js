import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Burger, Menu } from '..';
import Logo from '../../assets/img/NLN-logo-v4-orange2-not-transparent-xl.png';
import './Navbar.css';
import PubSub from '../../utils/pubsub';
import * as actionCreator from '../../actions/auth';

const SHOW_HAMBURGER_AT = 800;

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.onSignUpSubmit = this.onSignUpSubmit.bind(this);
        this.onLogInSubmit = this.onLogInSubmit.bind(this);
        this.state = {
            user: this.props.user,
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

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);

        this.userSub = PubSub.subscribe('User', (_, data) => {
            if (this.state.user !== data) {
                this.setState({ user: data })
            }
        });
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
            menu = <Hamburger {...this.props} />
        } else {
            menu = <NavList user={this.state.user} onSignUpSubmit={this.onSignUpSubmit} onLogInSubmit={this.onLogInSubmit} />
        }
        return (
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top" >
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img src={Logo} alt="New Life Nursery Logo" className="nav-logo" />
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
            user: this.props.user,
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
                    <Menu {...this.props} open={this.state.open} closeMenu={() => this.setState({ open: false })} />
                </div>
            </React.Fragment>
        );
    }
}

function NavList(props) {
    let location = useLocation();

    let options;
    if (props.user.token == null) {
        console.log('null token dum dum')
        console.log(props);
        options = <React.Fragment>
            <li className="nav-item">
                <Link className="nav-link"
                    to={{
                        pathname: "/register",
                        state: { background: location }
                    }}>Sign Up</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link"
                    to={{
                        pathname: "/login",
                        state: { background: location }
                    }}>Log In</Link>
            </li>
        </React.Fragment>
    } else {
        console.log('got the token')
        options = <React.Fragment>
            <li className="nav-item">
                <a className="nav-link" href="/" onClick={() => actionCreator.logout()}>Log Out</a>
            </li>
        </React.Fragment>
    }

    return (
        <React.Fragment>
            <div>
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link className="nav-link"
                            to={{
                                pathname: "/info",
                                state: { background: location }
                            }}>Info</Link>
                    </li>
                    {options}
                </ul>
            </div>
        </React.Fragment>
    );
}

export default Navbar;