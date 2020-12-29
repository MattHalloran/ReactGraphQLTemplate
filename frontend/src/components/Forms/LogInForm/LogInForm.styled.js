import styled from 'styled-components';
export const StyledLogInForm = styled.form`
    display: grid;
    min-width: 300px;

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
        background-color: black;
    }

    .form-body {
        background-color: ${({ theme }) => theme.bodySecondary};
        color: ${({ theme }) => theme.textSecondary};
        padding: 1em;
    }
`;