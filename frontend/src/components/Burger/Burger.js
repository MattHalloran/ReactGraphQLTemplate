import React from 'react';
import PropTypes from 'prop-types';
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
  open: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
};

export default Burger;