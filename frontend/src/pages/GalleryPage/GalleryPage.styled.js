import styled from 'styled-components';
export const StyledGalleryPage = styled.div`
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
    .full-image {
        max-width: 100%;
        max-height: 100%;
    }
`;