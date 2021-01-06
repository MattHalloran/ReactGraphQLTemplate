import styled from 'styled-components';
export const StyledGalleryPage = styled.span`
    padding-top: 12vh;

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

    .full-image {
        max-height: 100%;
        max-width: 100%;
        display: block;
    }

    .arrow {
        width: 100px;
        height: 100px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .arrow:hover {
        cursor: pointer;
    }

    .left {
        left: -20px;
    }

    .right {
        right: -20px;
    }
`;