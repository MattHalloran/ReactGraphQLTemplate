import styled from 'styled-components';
export const StyledArrowMenu = styled.div`
    .arrow-container {
        top: 5%;
        right: 0.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        width: 2rem;
        height: 2rem;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 10;
        position: relative;
        width: 2rem;
        height: 0.25rem;
        background: ${({ theme, open }) => open ? theme.textPrimary : theme.textPrimary};
        border-radius: 10px;
        transition: all 0.3s linear;
        position: relative;
        transform-origin: 1px;
    }

    &:focus {
        outline: none;
    }

`;