import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Burger, Menu } from '..';
import Logo from '../../assets/img/NLN-logo-v4-orange2-not-transparent-xl.png';
import PubSub from '../../utils/pubsub';
import * as authQuery from '../../query/auth';
import { StyledNavbar } from './Navbar.styled';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const SHOW_HAMBURGER_AT = 800;

const styles = {
    shoppingCart: {
        width: "1.5em",
        height: "1.5em",
    },
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            showHamburger: false,
        }
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
            <StyledNavbar className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top" >
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img src={Logo} alt="New Life Nursery Logo" className="nav-logo" />
                        New Life Nursery
                </Link>
                    {menu}
                </div>
            </StyledNavbar>
        );
    }
}

Navbar.propTypes = {
    user: PropTypes.object.isRequired,
}

class Hamburger extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.state = {
            open: false,
        }
    }
    toggleOpen = () => {
        this.setState({ open: !this.state.open });
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef(node) {
        console.log('WOOPDEE DOO', this.node);
        this.wrapperRef = node;
    }

    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            console.log('BOOPEBOOOOFHDUSHFKJHSFKJD');
            this.setState({ open: false });
        }
    }
    render() {
        return (
            <React.Fragment>
                <div ref={this.setWrapperRef}>
                    <Burger className="align-right" open={this.state.open} toggleOpen={this.toggleOpen} />
                    <Menu {...this.props} open={this.state.open} closeMenu={() => this.setState({ open: false })} />
                </div>
            </React.Fragment>
        );
    }
}

Hamburger.propTypes = {

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
                <a className="nav-link" href="/" onClick={() => authQuery.logout()}>Log Out</a>
            </li>
            <li className="nav-item">
                <Link to="cart" >
                    <ShoppingCartIcon style={styles.shoppingCart} />
                </Link>
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

NavList.propTypes = {
    user: PropTypes.object.isRequired,
}

export default Navbar;