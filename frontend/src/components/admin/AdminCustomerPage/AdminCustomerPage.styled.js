import styled from 'styled-components';

export const StyledAdminCustomerPage = styled.div`
    padding-top: 12vh;

    .card-flex {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, .5fr));
        grid-gap: 20px;
    }
`;

export const StyledCustomerCard = styled.div`
    background-color: white;
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 1px solid #ccc;
    border-radius: 1em;
    cursor: pointer;
`;