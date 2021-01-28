import styled from 'styled-components';

export const StyledAdminInventoryPage = styled.div`
    padding-top: 12vh;

    .flexed {
        display: grid;
        grid-template-columns: repeat(2, minmax(280px, 1fr));
        grid-gap: 20px;
        align-items: stretch;
    }

    .flex-content {
        border: 1px solid #ccc;
        border-radius: 1em;
    }

    .card-flex {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, .5fr));
        grid-gap: 20px;
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
    cursor: pointer;

    img {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }

    .icon-container {
        display: flex;
        justify-content: space-between;

        > .icon {
            display: inline-block;
            text-align: center;
            width: 30px;
            height: 30px;
            color: black;
            cursor: pointer;
        }
    }
`;

export const StyledSkuPopup = styled.div`
    
`;