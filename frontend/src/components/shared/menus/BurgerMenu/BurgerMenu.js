import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { StyledBurgerMenu } from './BurgerMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import ClickOutside from 'components/shared/wrappers/ClickOutside';

function BurgerMenu(props) {
  let history = useHistory();
  let [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setMenu(open => !open);
  }

  const setMenu = useCallback((is_open) => {
    setOpen(is_open);
    props?.menuClicked(is_open);
  },[props]);

  const closeMenu = useCallback(() => {
    setMenu(false);
  },[setMenu]);

  useEffect(() => {
    //Closes menu on url change
    let unlisten = history.listen(() => closeMenu());
    return () => unlisten();
  },[history, closeMenu])

  return (
    <StyledBurgerMenu open={open}>
      <ClickOutside {...props} active={open} on_click_outside={closeMenu} >
        <Burger toggle={toggleOpen} />
        <MenuContainer open={open} closeMenu={closeMenu}>
          {props.children}
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
          <p>AAAAAAAAAAAAA</p>
        </MenuContainer>
      </ClickOutside>
    </StyledBurgerMenu>
  );
}

BurgerMenu.propTypes = {
  menuClicked: PropTypes.func,
};

function Burger(props) {
  return (
    <div className="burger" onClick={props.toggle}>
      <div />
      <div />
      <div />
    </div>
  );
}

Burger.propTypes = {
  toggle: PropTypes.func.isRequired,
}

export default BurgerMenu;