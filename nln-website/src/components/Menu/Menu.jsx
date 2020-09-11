import React from 'react';
import { bool, func } from 'prop-types';
import { StyledMenu } from './Menu.styled';
import Container from '../Modal/Container/Container';
const onSignUpSubmit = (event) => {
  event.preventDefault(event);
};
const onLogInSubmit = (event) => {
  event.preventDefault(event);
}

const Menu = ({ open, closeMenu }) => {
  return (
    <StyledMenu open={open}>
      <Container triggerText="Sign Up" signUp={true} clickEvent={() => closeMenu()} onSubmit={onSignUpSubmit} class="nav-link" href="#" />
      <Container triggerText="Log In" signUp={false} clickEvent={() => closeMenu()} onSubmit={onLogInSubmit} class="nav-link" href="#" />
    </StyledMenu>
  )
}

Menu.propTypes = {
  open: bool.isRequired,
  closeMenu: func.isRequired
}

export default Menu;