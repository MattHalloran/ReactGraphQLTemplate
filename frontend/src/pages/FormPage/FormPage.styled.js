import styled from 'styled-components';

export const StyledFormPage = styled.div`
    max-width: 100%;
    max-height: 100%;
    padding: 2em;
    margin-top: calc(14vh + 20px);

    .form {
        display: grid;
        position: relative;
        background-color: ${({ theme }) => theme.lightBackgroundColor};
        box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
        min-width: 300px;
        max-width: ${({ maxWidth }) => maxWidth};
        border-radius: 10px;
        overflow: hidden;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 20px;
    }

    .half {
        display: inline-table;
        width: 50%;

        > div {
            margin-left: 5px;
            margin-right: 5px;
        }
    }

    .form-header-text {
        margin: 5px;
    }

    .form-body {
        padding: 1em;
        border-radius: 0 0 5px 5px;
    }

    .buttons-div {
        display: flex;
        align-items: baseline;
    }

    .submit {
        width: 100%;
        width: -moz-fit-content;
        width: -webkit-fill-available;
    }

    .horizontal-input-container {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-between;
        width: 100%;
    }
    
    .horizontal-input-container > * {
        display: block;
        margin-left: 5px;
        margin-right: 5px;
    }

    .horizontal-input-container > *:first-child {
        margin-left: 0px;
    }

    .horizontal-input-container > *:last-child {
        margin-right: 0px;
    }

    @media (max-width: ${({ theme }) => theme.mobile}) {
        padding: 0.5em;

        .horizontal-input-container {
            display: inline;
        }

        .horizontal-input-container > * {
            margin-left: 0;
            margin-right: 0;
        }
    }
`