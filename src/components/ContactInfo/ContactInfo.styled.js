import styled from 'styled-components';

export const StyledContactInfo = styled.div`
    list-style-type: none;

    .contact-header {
        background-color: ${({ theme }) => theme.bodyPrimary};
        padding: 10px;
        font-size: 1.5em;
        text-align: center;
    }

    .hours-header {
        text-align: center;
    }

    .hours-content-div {
        display: block;
        margin: auto;
        text-align: left;
        border-top: 3px solid ${({ theme }) => theme.textPrimary};
        border-bottom: 3px solid ${({ theme }) => theme.textPrimary};
    }

    tbody {
        display: grid;
    }

    tr {
        box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.4);
    }

    .external-links {
        width: 100%;
        width: -moz-fit-content;
        width: -webkit-fill-available;
        margin: 10px 0 10px 0;
    }

    .bottom-div {
        padding-bottom: 5px;
        border-bottom: 1px solid black;
    }

    @media (max-width: 400px) {
        .external-link-text {
            display: none;
        }
    }

    .icon-group {
        overflow-wrap: anywhere;
        font-size: 0.8em;
        cursor: pointer;
        width: 33%;
    }

    .icon {
        display: inline-block;
        padding: 10px;
        border: 1px solid black;
        background-color: darkgreen;
        border-radius: 200px;
        transition-duration: 0.4s;

        :hover {
            box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
        }

        > * {
            fill: ${({ theme }) => theme.textPrimary};
            stroke: none;
        }
    }

    tr {
        display: grid
    }

    td, th {
        border-bottom: 1px solid black;
    }
`;