import React from 'react';
import PropTypes from 'prop-types';
import { StyledBurgerMenu } from './BurgerMenu.styled';
import MenuContainer from '../MenuContainer';
import ClickOutside from 'components/shared/wrappers/ClickOutside';

class BurgerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    }
    this.toggleOpen = this.toggleOpen.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      this.closeMenu();
    })
  }

  componentWillUnmount() {
    this.unlisten();
  }

  toggleOpen = () => {
    console.log("TOGGLE OPEN", this.state.open);
    this.setState({ open: !this.state.open }, () => console.log('BLEEOP', this.state.open));
  }

  closeMenu = () => {
    this.setState({ open: false });
  }

  render() {
    return (
      <StyledBurgerMenu open={this.state.open}>
        <ClickOutside {...this.props} on_click_outside={this.closeMenu} >
          <Burger toggle={this.toggleOpen} />
          <MenuContainer open={this.state.open} closeMenu={this.closeMenu}>
            {this.props.children}
          </MenuContainer>
        </ClickOutside>
      </StyledBurgerMenu>
    );
  }
}

BurgerMenu.propTypes = {
  history: PropTypes.object.isRequired,
};

class Burger extends React.Component {
  render() {
    return (
      <div className="burger" onClick={this.props.toggle}>
        <div />
        <div />
        <div />
      </div>
    );
  }
}

export default BurgerMenu;