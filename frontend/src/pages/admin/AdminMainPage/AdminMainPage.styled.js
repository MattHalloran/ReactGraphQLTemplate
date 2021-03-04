import styled from 'styled-components';

export const StyledAdminMainPage = styled.div`
    color: ${({ theme }) => theme.headerText};

    .flexed {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        grid-gap: 20px;
        align-items: stretch;
    }

    .admin-card {
        margin: 20px;
        padding: 10px;
        min-width: 150px;
        min-height: 50px;
        border: 1px solid #ccc;
        border-radius: 1em;
        background-color: ${({ theme }) => theme.darkPrimaryColor};
    }

    .admin-card:hover {
        cursor: pointer;
        box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
    }
`;