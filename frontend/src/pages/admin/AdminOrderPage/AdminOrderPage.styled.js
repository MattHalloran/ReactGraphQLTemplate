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
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 2px solid ${({ theme }) => theme.primaryText};
    border-radius: 1em;
    cursor: pointer;
`;

export const StyledOrderPopup = styled.div`
    
`;