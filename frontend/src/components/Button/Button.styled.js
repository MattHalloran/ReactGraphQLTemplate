import styled from 'styled-components';

export const StyledButton = styled.button`
    background-color: ${({ disabled }) => disabled ? 'rgb(164, 164, 164)' : '#4CAF50'};
    border: none;
    color: ${({ theme }) => theme.textPrimary};
    padding: 16px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    border-radius: 10px;
    pointer-events: ${({ disabled }) => disabled ? 'none' : ''};

    :hover {
        box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
    }
`