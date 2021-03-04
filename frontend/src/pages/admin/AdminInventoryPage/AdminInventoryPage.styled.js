import styled from 'styled-components';

export const StyledAdminInventoryPage = styled.div`
    .card-flex {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
`;

export const StyledCard = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.darkPrimaryColor};
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border-radius: 1em;
    cursor: pointer;

    .deleted {
        border: 2px solid red;
    }

    .inactive {
        border: 2px solid grey;
    }

    .active {
        border: 2px solid lightgreen;
    }

    .title {
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

    img {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }

    .size-container {
        display: block;
        margin: 5px;
        text-align: left;

        > * {
            display: inline-block;
            background-color: ${({ theme }) => theme.accentColor};
            border: 1px solid black;
            border-radius: 10px;
            max-width: 100px;
            padding: 0 10px 0 10px;
            margin: 5px 0 0 5px;
        }
    }
`;

export const StyledPlantPopup = styled.div`
    background: ${({ theme }) => theme.primaryColor};
    display: block;
    padding: 1em;
    padding-left: calc(150px + 1em);
    width: 500px;
    max-width: 100%;
    max-width: -moz-fit-content;
    max-width: -webkit-fill-available;

    .sidenav {
        height: 100%;
        width: 150px;
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        border-right: 2px solid ${({ theme }) => theme.primaryText};
        overflow-x: hidden;

        .sku-list {
            max-height: 80%;
            overflow-y: scroll;
            border-top: 2px solid ${({ theme }) => theme.primaryText};
            border-bottom: 2px solid ${({ theme }) => theme.primaryText};

            .sku-option {
                cursor: pointer;
                overflow-wrap: anywhere;
                padding-bottom: 3px;
                border-bottom: 1px solid ${({ theme }) => theme.primaryText};
            }

            .selected {
                background-color: rgba(255, 255, 255, 0.45);
                box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
            }
        }

        .delete-sku {
            position: fixed;
            left: 10px;
            bottom: 55px;
        }

        .add-sku {
            position: fixed;
            left: 10px;
            bottom: 0;
        }
    }

    .plant-info-div {
        max-height: 60%;
        border-bottom: 3px solid ${({ theme }) => theme.primaryText};
    }

    .sku-info-div {
        max-height: 40%;
    }

    .half {
        display: inline-block;
        width: 50%;
    }

    .third {
        display: inline-block;
        width: 33%;
    }

    .display-image {
        border: 1px solid black;
        max-width: 100%;
        max-width: -webkit-fill-available;
        max-height: 100%;
        max-height: -webkit-fill-available;
        bottom: 0;
    }
`;