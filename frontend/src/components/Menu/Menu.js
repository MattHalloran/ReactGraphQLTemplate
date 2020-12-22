import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenu } from './Menu.styled';
import { Link } from 'react-router-dom';
import ContactInfo from '../ContactInfo';
import * as authQuery from '../../query/auth';

class Menu extends React.Component {
  //const location = useLocation();
  constructor(props) {
    super(props);
    this.closeMenu = this.props.closeMenu;
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.touchStart = 0;
    this.touchEnd = 0;
  }

  handleTouchStart(event) {
    this.touchStart = event.targetTouches[0].clientX;
  }

  handleTouchMove(event) {
    this.touchEnd = event.targetTouches[0].clientX;
  }

  handleTouchEnd(event) {
    if (this.touchEnd - this.touchStart > 100) {
      this.closeMenu();
    }
    console.log(this.touchStart, this.onTouchEnd, event);
  }

  render() {
    let admin_options;
    let account_options;
    let roles = this.props.user_roles;
    if (roles instanceof Array) {
      roles?.forEach(r => {
        if (r.title === "Admin") {
          admin_options = <React.Fragment>
            <Link to={{
              pathname: "/admin"
            }}
              onClick={this.closeMenu}>Admin</Link>
          </React.Fragment>
        }
      })
    }
    if (this.props.token == null) {
      account_options = <React.Fragment>
        <Link to={{
          pathname: "/register"
        }} 
        onClick={this.closeMenu}>Sign Up</Link>
        <Link to={{
          pathname: "/login"
        }}
        onClick={this.closeMenu}>Log In</Link>
      </React.Fragment>
    } else {
      account_options = <React.Fragment>
        <a href="/" onClick={() => { 
          this.closeMenu();
          authQuery.logout()
          }}>Log Out</a>
      </React.Fragment>
    }

    return (
      
      <StyledMenu open={this.props.open}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}>
        {admin_options}
        {account_options}
        {/* Things displayed no matter the login status */}
        <ContactInfo />
      </StyledMenu>
    );
  }
}

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
  user_roles: PropTypes.array,
  token: PropTypes.string,
}

export default Menu;