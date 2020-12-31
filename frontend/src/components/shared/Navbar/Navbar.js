import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import BurgerMenu from '../menus/BurgerMenu';
import Logo from 'assets/img/NLN-logo-v4-orange2-not-transparent-xl.png';
import * as authQuery from 'query/auth';
import { StyledNavbar } from './Navbar.styled';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ContactInfo from 'components/shared/ContactInfo';

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
            showHamburger: false,
        }
    }

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

    render() {

        let menu;
        if (this.state.showHamburger) {
            menu = <Hamburger {...this.props} />
        } else {
            menu = <NavList {...this.props} />
        }
        return (
            <StyledNavbar visible={this.props.visible}>
                <Link to="/" className="nav-brand">
                    <img src={Logo} alt="New Life Nursery Logo" className="nav-logo" />
                    <span className="nav-name">New Life Nursery</span>
                </Link>
                {menu}
            </StyledNavbar>
        );
    }
}

Navbar.propTypes = {
    token: PropTypes.string,
}

function Hamburger(props) {
    let admin_options;
    let account_options;
    let roles = props.user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === "Admin") {
                admin_options = <React.Fragment>
                    <Link to="/admin">Admin</Link>
                </React.Fragment>
            }
        })
    }
    if (props.token == null) {
        account_options = <React.Fragment>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Log In</Link>
        </React.Fragment>
    } else {
        account_options = <React.Fragment>
            <Link to="/" onClick={authQuery.logout}>Log Out</Link>
        </React.Fragment>
    }

    return (
        <BurgerMenu {...props}>
            {admin_options}
            {account_options}
            {/* Things displayed no matter the login status */}
            <ContactInfo />
        </BurgerMenu>
    );
}

function NavList(props) {
    let admin_options;
    let roles = props.user_roles;
    if (roles instanceof Array) {
        roles?.forEach(r => {
            if (r.title === "Admin") {
                admin_options = <React.Fragment>
                    <li className="nav-item">
                        <Link to="/admin">Admin</Link>
                    </li>
                </React.Fragment>
            }
        })
    }
    let location = useLocation();
    let options;
    if (props.token == null) {
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
        options = <React.Fragment>
            <li className="nav-item">
                <a className="nav-link" href="/" onClick={() => authQuery.logout()}>Log Out</a>
            </li>
            <li className="nav-item">
                <Link to="/cart" >
                    <ShoppingCartIcon style={styles.shoppingCart} />
                </Link>
            </li>
        </React.Fragment>
    }

    return (
        <ul className="nav-list">
            {admin_options}
            <li className="nav-item">
                <Link className="nav-link"
                    to="/info">Info</Link>
            </li>
            {options}
        </ul>
    );
}

NavList.propTypes = {
    token: PropTypes.string,
    user_roles: PropTypes.array,
}

export default Navbar;