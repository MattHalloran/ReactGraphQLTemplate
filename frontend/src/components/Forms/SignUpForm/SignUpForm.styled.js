import styled from 'styled-components';
export const StyledSignUpForm = styled.form`
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

    .toggle-active,
    .toggle-inactive {
        cursor: pointer;
        padding-right: 5px;
    }

    .toggle-active {
        color:blue;
    }

    .toggle-inactive {
        color:black
    }

    .form-input {
        padding-bottom: 20px !important;
    }
`;