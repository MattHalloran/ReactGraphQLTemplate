import styled from 'styled-components';

export const StyledShoppingList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    align-items: stretch;

    > *:hover {
        cursor: pointer;
        box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
    }
`;

export const StyledSkuCard = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.bodySecondary};
    color: black;
    margin: 10px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 1px solid black;
    border-radius: 10px;

    .title {
        color: ${({ theme }) => theme.textPrimary};
        position: absolute;
        width: 100%;
        text-align: center;
        background-color: rgba(0,0,0,.4);
        margin: 0;
        border-radius: 10px 10px 0 0;
        padding: 0.5em 0 0.5em 0;
        left: 0;
        top: 0;
        z-index: 2;
    }

    .size-container {
        display: block;
        margin: 5px;
        text-align: left;

        > * {
            display: inline-block;
            background-color: cornflowerblue;
            border: 1px solid black;
            border-radius: 10px;
            max-width: 70px;
            padding: 0 10px 0 10px;
            margin: 5px 0 0 5px;
        }
    }

    .display-image {
        display: block;
        position: absolute;
        width: 100%;
        top: 0%;
    }

    .display-image-container {
        border: 1px solid black;
        width: 100%;
        position: relative; /* Ensures 1:1 Aspect Ratio */
        height: 0; /* Ensures 1:1 Aspect Ratio */
        padding-top: 100%; /* Ensures 1:1 Aspect Ratio */
    }
`;

export const StyledExpandedSku = styled.div`
    background-color: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textPrimary};
    display: block;
    width: 100%;
    height: 100%;
    min-width: 50vw;

    .display-image {
        display: inline-block;
        top: 0%;
    }

    .trait-list {
        display: block;
        overflow-y: auto;
    }

    .trait-container {
        margin: 0.5em;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .trait-icon {
        padding: 1px;
        vertical-align: middle;
        display: inline-block;
    }

    p {
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
    }

    li {
        list-style-type: none;
    }

    .center {
        text-align: center;
    }

    .description-container {
        overflow-y: auto;
        border-top: 2px solid ${({ theme }) => theme.textPrimary};
        border-bottom: 2px solid ${({ theme }) => theme.textPrimary};
    }

    .title {
        position: absolute;
        width: 100%;
        text-align: center;
        background-color: rgba(0,0,0,.4);
        margin: 0;
        border-radius: 10px 10px 0 0;
        padding: 0.5em 0 0.5em 0;
    }

    img {
        max-height: 40vh;
        max-width: 100%;
        display: inline-block;
        border-radius: 10px 10px 0 0;
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

    .bottom-div {
        height: 10%;
        align-items: center;
        padding: 0 10px;
        border-top: 2px solid ${({ theme }) => theme.textPrimary};
    }

    .quantity-div {
        display: flex;
        width: 25%;

        > * {
            width: 75%;
        }

        > svg {
            stroke: none;
            fill: ${({ theme }) => theme.textPrimary};
            padding: 0 10px;
            width: 25%;
        }
    }
`;