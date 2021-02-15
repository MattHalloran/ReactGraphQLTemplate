import styled from 'styled-components';


const directionStyle = (direction, left, top) => {
    if (direction === "column") {
        return `position = absolute;
        left = ${left};
        top = ${top};`
    }
    return ''
}

export const StyledGalleryPhoto = styled.img`
    margin: ${({ margin }) => `${margin}px`};
    ${({ direction, left, top }) => directionStyle(direction, left, top)}

    :hover {
        cursor: pointer;
    }
`;