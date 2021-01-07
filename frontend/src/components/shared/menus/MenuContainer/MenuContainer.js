import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenuContainer } from './MenuContainer.styled';

function MenuContainer(props) {
  let touchStart = 0;
  let touchEnd = 0;

  const handleTouchStart = (event) => touchStart = event.targetTouches[0].clientX;

  const handleTouchMove = (event) => touchEnd = event.targetTouches[0].clientX;

  const handleTouchEnd = () => {
    if (touchEnd - touchStart > 100) {
      props.closeMenu();
    }
  }

  return (
    <StyledMenuContainer
      open={props.open}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}>
      {props.children}
    </StyledMenuContainer>
  );
}

MenuContainer.propTypes = {
  open: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
}

export default MenuContainer;