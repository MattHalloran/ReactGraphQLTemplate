import styled from 'styled-components';

export const StyledAdminOrderPage = styled.div`
    .card-flex {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, .5fr));
        grid-gap: 20px;
    }
`;

export const StyledOrderCard = styled.div`
    background-color: ${({ theme }) => theme.darkPrimaryColor};
    color: ${({ theme }) => theme.headerText};
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border-radius: 1em;
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    cursor: pointer;
`;

export const StyledOrderPopup = styled.div`
    
`;