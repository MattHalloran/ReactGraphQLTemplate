import styled from 'styled-components';

export const StyledFormPage = styled.div`
    max-width: 100%;
    max-height: 100%;
    padding: 2em;
    margin-top: calc(14vh + 20px);

    @media (max-width: ${({ theme }) => theme.mobile}) {
        padding: 0;
    }

    .form {
        display: grid;
        position: relative;
        background-color: ${({ theme }) => theme.bodySecondary};
        min-width: 300px;
        max-width: ${({ maxWidth }) => maxWidth};
        border: 4px solid black;
        border-radius: 10px;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 20px;
    }

    .form-header {
        background-color: rgba(0, 0, 0, .6);
        padding: 1em 0.5em 0.5em 1em;
        text-align: center;
        border-radius: 5px 5px 0 0;
    }

    .form-header-text {
        margin: 5px;
    }

    .form-body {
        color: ${({ theme }) => theme.textPrimary};
        padding: 1em;
        border-radius: 0 0 5px 5px;
    }

    .submit {
        width: 100%;
        width: -moz-fit-content;
        width: -webkit-fill-available;
    }

    .horizontal-input-container {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        width: 100%;
    }
    
    .horizontal-input-container > * {
        margin-left: 5px;
        margin-right: 5px;
        width: 100%;
    }

    .horizontal-input-container > *:first-child {
        margin-left: 0px;
    }

    .horizontal-input-container > *:last-child {
        margin-right: 0px;
    }
`