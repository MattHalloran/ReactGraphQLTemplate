import styled from 'styled-components';

export const StyledButton = styled.button`
    background-color: ${({ theme, disabled }) => disabled ? 'rgb(164, 164, 164)' : theme.accentColor};
    border: none;
    color: ${({ theme }) => theme.headerText};
    padding: 16px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.2s;
    cursor: pointer;
    border-radius: 10px;
    pointer-events: ${({ disabled }) => disabled ? 'none' : ''};

    //disable text selection
    -ms-user-select:none;
    -moz-user-select:none;
    -webkit-user-select:none;
    -webkit-touch-callout: none;
    -khtml-user-select: none;
        user-select:none;

    :hover {
        box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.2);
    }
`