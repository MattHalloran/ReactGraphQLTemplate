import styled from 'styled-components';
export const StyledFormPage = styled.div`
    max-width: 100%;
    max-height: 100%;
    padding: 2em;
    margin-top: 14vh;
    border: 2px solid red;

    @media (max-width: ${({ theme }) => theme.mobile}) {
        padding: 0;
    }
`