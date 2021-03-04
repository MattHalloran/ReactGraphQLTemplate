import styled from 'styled-components';

export const StyledArrowMenu = styled.div`

    .arrow {
        border: none;
        cursor: pointer;
        z-index: 200;
        transition: all 0.3s linear;
        position: fixed;
        transform: ${({ open }) => open ? 'translateX(400px) scaleX(-1)' : 'transformX(0px) scaleX(1)'};
        fill: ${({ theme }) => theme.headerText};
        stroke: ${({ theme }) => theme.primaryText};
        stroke-width: 0.5px;
        padding: 5px;
    }

    @media (max-width: ${({ theme }) => theme.mobile}) {
        .arrow {
            transform: ${({ open, theme }) => open ? `translateX(${theme.mobile}) scaleX(-1)` : 'transformX(0px) scaleX(1)'};
        }
    }

    .arrow > * {
        margin: 0;
        transition: 0.4s;
      }

    &:focus {
        outline: none;
    }

`;