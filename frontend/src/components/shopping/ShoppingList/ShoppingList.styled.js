import styled from 'styled-components';
export const StyledShoppingList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-gap: 20px;
    align-items: stretch;

    > * {
        margin: 20px;
        padding: 10px;
        min-width: 150px;
        min-height: 50px;
        border: 1px solid #ccc;
        border-radius: 1em;
    }

    > *:hover {
        cursor: pointer;
        box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
    }
`;

export const StyledExpandedSku = styled.div`
    display: flex;
    width: 100%;
    height: 100%;

    .main-content {
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