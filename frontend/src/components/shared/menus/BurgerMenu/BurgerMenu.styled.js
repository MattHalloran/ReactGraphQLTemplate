import styled from 'styled-components';
export const StyledBurgerMenu = styled.div`

  .burger {
    display: inline-block;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 100;
    position: relative;
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