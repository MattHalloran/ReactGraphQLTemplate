import styled from 'styled-components';

export const StyledSlide = styled.img`
    height: 100%;
    width: ${({ width }) => width}px;
    object-fit: cover;
    overflow: hidden;
`;