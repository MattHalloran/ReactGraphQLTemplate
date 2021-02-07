import styled from 'styled-components';

const getStatusColor = (status) => {
    if (status === 'DELTED') return 'red';
    if (status === 'INACTIVE') return 'grey';
    if (status === 'ACTIVE') return 'lightgreen';
    return '';
}

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

export const StyledCard = styled.div`
    background-color: white;
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 5px solid ${({ status }) => getStatusColor(status)};
    border-radius: 1em;
    cursor: pointer;

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
`;