import styled from 'styled-components';

// Darkens everything besides the open menu
const overlay_style = `
    position: fixed; 
    left: 0;
    top: 0;
    width: 100%;
    width: -moz-fit-content;
    width: -webkit-fill-available;
    height: 100%;
    height: -moz-fit-content;
    height: -webkit-fill-available;
    overflow: hidden;
    z-index: 10;
    background-color: rgba(0,0,0,.5);
`

export const StyledBurgerMenu = styled.div`
    position: absolute;
    display: block;
    right: 0px;

  #overlay {
    transition: 0.3s ease-in-out;
    ${({ open }) => open ? overlay_style : ''};
  }

  .burger {
    position: relative;
    display: block;
    border: none;
    cursor: pointer;
    padding: 0;
    right: 1em;
  }

  &:focus {
    outline: none;
  }

  .burger > * {
    width: 35px;
    height: 5px;
    background-color: ${({ theme }) => theme.headerText};
    margin: 6px 0;
    transition: 0.4s;
    border-radius: 50px;
  }
`;