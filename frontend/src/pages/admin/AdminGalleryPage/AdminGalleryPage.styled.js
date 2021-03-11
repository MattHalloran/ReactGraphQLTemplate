import styled from 'styled-components';

export const StyledAdminGalleryPage = styled.div`
    .cart-table {
        width: -webkit-fill-available;
        width: calc(100% - 40px);
        text-align: left;
        margin-left: 20px;
        margin-right: 20px;
        border-collapse: collapse;
        border: 2px solid ${({ theme }) => theme.primaryText};
        background-color: ${({ theme }) => theme.darkPrimaryColor};
        color: ${({ theme }) => theme.headerText};
    }

    .cart-image {
        width: 100px;
        height: 100px;
    }

    thead {
        line-height: 50px;
    }

    tr {
        border-bottom: 1px solid ${({ theme }) => theme.primaryText};
    }

    .product-row {
        display: flex;
        align-items: center;

        > svg {
            stroke: none;
            fill: ${({ theme }) => theme.headerText};
            margin: 0 5px 0 5px
        }
    }
`;