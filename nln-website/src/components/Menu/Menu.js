import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenu } from './Menu.styled';
import { Link, useLocation } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import * as actionCreators from '../../actions/auth';

function Menu(props) {
  let location = useLocation();

  return (
    <UserContext.Consumer>
      {(user) => (
        <StyledMenu open={props.open}>
          {user.token == null && (
            <React.Fragment>
              <Link to={{
                pathname: "/register",
                state: { background: location }
              }}>Sign Up</Link>
              <Link to={{
                pathname: "/login",
                state: { background: location }
              }}>Log In</Link>
            </React.Fragment>
          )}
          {user.token != null && (
            <a href="/" onClick={() => actionCreators.logout()}>Log out</a>
          )}
        </StyledMenu>
      )}
    </UserContext.Consumer>
  );
}

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
}

export default Menu;