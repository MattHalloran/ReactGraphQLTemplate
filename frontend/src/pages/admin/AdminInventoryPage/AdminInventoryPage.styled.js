import styled from 'styled-components';

const SkuStatus = {
    '-2': 'red', //Deleted
    '-1': 'grey', //inactive
    '1': 'lightgreen', //active
}

const getStatusColor = (status) => {
    return SkuStatus[status+''] ?? 'red';
}

export const StyledAdminInventoryPage = styled.div`
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
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
`;

export const StyledCard = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.bodySecondary};
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 5px solid ${({ status }) => getStatusColor(status)};
    border-radius: 1em;
    cursor: pointer;

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

    img {
        display: block;
        max-width: 100%;
        max-height: 100%;
    }
`;

export const StyledSkuPopup = styled.div`
    background: ${({ theme }) => theme.bodyPrimary};
    display: block;
    padding: 1em;
    width: 500px;
    max-width: 100%;
    max-width: -moz-fit-content;
    max-width: -webkit-fill-available;

    .half {
        display: inline-block;
        width: 50%;
    }

    .display-image {
        border: 1px solid black;
        max-width: 100%;
        max-width: -webkit-fill-available;
        max-height: 100%;
        max-height: -webkit-fill-available;
    }
`;