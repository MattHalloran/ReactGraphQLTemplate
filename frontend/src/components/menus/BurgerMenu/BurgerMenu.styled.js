import styled from 'styled-components';

export const StyledBurgerMenu = styled.div`
    position: absolute;
    display: block;
    right: 0px;

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