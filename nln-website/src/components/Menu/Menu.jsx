import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenu } from './Menu.styled';
import { Link, useLocation } from 'react-router-dom';

function Menu(props) {
  let location = useLocation();
  return (
    <StyledMenu open={props.open}>
      <Link to={{
        pathname: "/register",
        state: { background: location }
      }}>Sign Up</Link>
      <Link to={{
        pathname: "/login",
        state: { background: location }
      }}>Log In</Link>
    </StyledMenu>
  );
}

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
}

export default Menu;