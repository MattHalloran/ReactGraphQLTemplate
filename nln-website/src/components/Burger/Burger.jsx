import React from 'react';
import { bool, func } from 'prop-types';
import { StyledBurger } from './Burger.styled';

const Burger = ({ open, toggleOpen }) => {
  return (
    <StyledBurger open={open} onClick={() => toggleOpen()}>
      <div />
      <div />
      <div />
    </StyledBurger>
  )
}

Burger.propTypes = {
  open: bool.isRequired,
  toggleOpen: func.isRequired,
};

export default Burger;