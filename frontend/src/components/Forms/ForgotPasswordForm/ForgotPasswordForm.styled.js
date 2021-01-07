import styled from 'styled-components';
export const StyledForgotPasswordForm = styled.form`
    display: grid; 
    background-color: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary}

    /* Secondary color links */
    a:link {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:visited {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:hover {
        color: ${({ theme }) => theme.textSecondary};
    }

    .form-header {
        background-color: ${({ theme }) => theme.bodyPrimary};
        padding: 1em 0.5em 0.5em 1em;
    }

    .form-header-text {
        margin: 5px;
    }

    .form-body {
        background-color: ${({ theme }) => theme.bodySecondary};
        color: ${({ theme }) => theme.textSecondary};
        padding: 1em;
    }

    .submit {
        width: -webkit-fill-available;
    }
`;