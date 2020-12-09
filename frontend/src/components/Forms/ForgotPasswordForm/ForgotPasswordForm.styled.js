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
`;