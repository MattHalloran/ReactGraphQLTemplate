import styled from 'styled-components';

export const StyledSliderContent = styled.div`
    transform: translateX(-${({ translate }) => translate}px);
    transition: transform ease-out ${({ transition }) => transition}ms;
    height: 100%;
    width: ${({ width }) => width}px;
    display: flex;
`;