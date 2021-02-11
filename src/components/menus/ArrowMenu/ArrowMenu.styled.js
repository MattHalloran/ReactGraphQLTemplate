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

export const StyledArrowMenu = styled.div`
  #overlay {
    transition: 0.3s ease-in-out;
    ${({ open }) => open ? overlay_style : ''};
  }

    .arrow {
        border: none;
        cursor: pointer;
        z-index: 200;
        transition: all 0.3s linear;
        position: fixed;
        transform: ${({ open }) => open ? 'translateX(400px) scaleX(-1)' : 'transformX(0px) scaleX(1)'};
        fill: ${({ theme }) => theme.textPrimary};;
        stroke: black;
        stroke-width: 0.5px;
        padding: 5px;
    }

    .arrow > * {
        margin: 0;
        transition: 0.4s;
      }

    &:focus {
        outline: none;
    }

`;