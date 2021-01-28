import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import { PUBS } from 'consts';
import { StyledBurgerMenu } from './BurgerMenu.styled';
import MenuContainer from '../MenuContainer/MenuContainer';
import ClickOutside from 'components/shared/wrappers/ClickOutside/ClickOutside';

function BurgerMenu(props) {
  console.log('BURGER PROPS', props)
  let history = useHistory();
  let [open, setOpen] = useState(false);

  useEffect(() => {
    let openSub = PubSub.subscribe(PUBS.BurgerMenuOpen, (_, b) => {
      console.log('I GOTTA PEEE', b)
      setOpen(open => b === 'toggle' ? !open : b);
    });
    return (() => {
      PubSub.unsubscribe(openSub);
    })
  }, [])

  const toggleOpen = () => PubSub.publish(PUBS.BurgerMenuOpen, 'toggle');
  const closeMenu = () => PubSub.publish(PUBS.BurgerMenuOpen, false);

  useEffect(() => {
    //Closes menu on url change
    let unlisten = history.listen(() => closeMenu());
    return () => unlisten();
  },[history, closeMenu])

  return ReactDOM.createPortal(
    <StyledBurgerMenu open={open} {...props}>
      <div id="overlay"/>
      <ClickOutside {...props} active={open} on_click_outside={closeMenu} >
        <Burger onClick={toggleOpen} />
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
    </StyledBurgerMenu>,
    document.body
  );
}

BurgerMenu.propTypes = {
};

function Burger(props) {
  return (
    <div className="burger" onClick={props.onClick}>
      <div />
      <div />
      <div />
    </div>
  );
}

Burger.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default BurgerMenu;