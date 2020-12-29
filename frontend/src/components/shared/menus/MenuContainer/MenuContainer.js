import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenuContainer } from './MenuContainer.styled';

class MenuContainer extends React.Component {
  constructor(props) {
    super(props);
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

  handleTouchEnd() {
    if (this.touchEnd - this.touchStart > 100) {
      this.props.closeMenu();
    }
  }

  render() {
    return (
      <StyledMenuContainer
        open={this.props.open}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}>
        {this.props.children}
      </StyledMenuContainer>
    );
  }
}

MenuContainer.propTypes = {
  open: PropTypes.bool.isRequired,
}

export default MenuContainer;