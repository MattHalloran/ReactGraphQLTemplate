import styled from 'styled-components';
export const StyledFormPage = styled.div`
    max-width: 100%;
    max-height: 100%;
    padding: 2em;
    margin-top: 14vh;

    @media (max-width: ${({ theme }) => theme.mobile}) {
        padding: 0;
    }

    .form {
        display: grid;
        min-width: 300px;
        border: 4px solid black;
        border-radius: 10px;
    }

    .form-header {
        background-color: ${({ theme }) => theme.bodyPrimary};
        padding: 1em 0.5em 0.5em 1em;
        text-align: center;
        border-radius: 10px;
    }

    .form-header-text {
        margin: 5px;
    }

    .form-body {
        background-color: ${({ theme }) => theme.bodySecondary};
        color: ${({ theme }) => theme.textSecondary};
        padding: 1em;
        border-radius: 0 0 5px 5px;
    }

    .submit {
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