import styled from 'styled-components';

// Darkens everything besides the open menu
const overlay_style = `
    position: fixed; 
    left: 0;
    top: 0;
    width: 100vh; 
    height: 100vh;
    overflow: hidden;
    z-index: 10;
    background-color: rgba(0,0,0,.5);
`

export const StyledBurgerMenu = styled.div`

  #overlay {
    transition: 0.3s ease-in-out;
    ${({ open }) => open ? overlay_style : ''};
  }

  .burger {
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 101;
    position: fixed;
    right: 1em;
    top: 50%;
    transform: translate(0, -50%);
    transition: all 0.3s ease-in-out;
    transform-origin: 1px
  }

  &:focus {
    outline: none;
  }

  .burger > * {
    width: 35px;
    height: 5px;
    background-color: ${({ theme, open }) => open ? theme.textPrimary : theme.textPrimary};
    margin: 6px 0;
    transition: 0.4s;
    border-radius: 50px;
  }

  .burger > *:first-child {
    transform: ${({ open }) => open ? 'rotate(45deg) translate(8px, 8px)' : 'rotate(0)'};
  }

  .burger > *:nth-child(2) {
    opacity: ${({ open }) => open ? '0' : '1'};
  }

  .burger > *:nth-child(3) {
    transform: ${({ open }) => open ? 'rotate(-45deg) translate(8px, -8px)' : 'rotate(0)'};
  }
`;