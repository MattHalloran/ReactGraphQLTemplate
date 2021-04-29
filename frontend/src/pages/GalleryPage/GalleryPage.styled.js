import styled from 'styled-components';

export const StyledGalleryPage = styled.div`
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

    .arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        stroke: ${({ theme }) => theme.primaryText};
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