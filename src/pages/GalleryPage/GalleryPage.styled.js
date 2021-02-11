import styled from 'styled-components';

export const StyledGalleryPage = styled.span`
    .tile {
        min-width: 10%;
        min-height: 10%;
        width: 400px;
        max-width: 50%;
        max-height: 50%;
        border: 1px solid black;
    }
`;

export const StyledGalleryImage = styled.div`
    display: flex;
    width: 100%;
    height: 100%;

    img {
        max-height: 90vh;
        max-width: 100%;
        display: block;
        border-radius: 10px;
        object-fit: contain;
    }

    .arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        stroke: ${({ theme }) => theme.textPrimary};
    }

    .arrow:hover {
        cursor: pointer;
    }

    .left {
        left: -50px;
    }

    .right {
        right: -50px;
    }
`;