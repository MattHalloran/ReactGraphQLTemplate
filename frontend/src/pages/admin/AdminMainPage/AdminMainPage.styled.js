import styled from 'styled-components';
export const StyledAdminMainPage = styled.div`
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
    }

    .admin-card:hover {
        cursor: pointer;
        box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
    }
`;