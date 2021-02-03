import styled from 'styled-components';
export const StyledShoppingList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-gap: 20px;
    align-items: stretch;

    > *:hover {
        cursor: pointer;
        box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
    }
`;

export const StyledSkuCard = styled.div`
    background-color: white;
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 1px solid #ccc;
    border-radius: 1em;

    .title {
        
    }

    .size {

    }

    .display-image-container {
        border: 1px solid black;
        width: 100%;
        position: relative; /* Ensures 1:1 Aspect Ratio */
        height: 0; /* Ensures 1:1 Aspect Ratio */
        padding-top: 100%; /* Ensures 1:1 Aspect Ratio */
    }

    .display-image {
        display: block;
        position: absolute;
        width: 100%;
        top: 0%;
    }
`;

export const StyledExpandedSku = styled.div`
    display: flex;
    width: 100%;
    height: 100%;

    .trait-list {
        overflow-y: auto;
        display: block;
        max-height: 15%;
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
        max-height: 15%;
        overflow-y: auto;
        border-top: 2px solid white;
        border-bottom: 2px solid white;
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
        max-height: 60vh;
        max-width: 100%;
        display: block;
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
`;