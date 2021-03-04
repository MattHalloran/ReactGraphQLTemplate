import styled from 'styled-components';

export const StyledCheckBox = styled.div`
    display: flex;
    align-items: center;
    padding: 1px;

    .border {
        position: relative;
        border: 2px solid ${({ theme }) => theme.primaryText};;
        border-radius: 4px;
        width: 20px;
        height: 20px;
        margin-right: 8px;
    }

    .indicator {
        position: absolute;
        z-index: 1;
        border-radius: 2px;
        background: ${({ theme }) => theme.accentColor};
        width: 16px;
        height: 16px;
        margin: 2px;
        transform: scale(0);
    }

    .indicator.checked {
        transform: scale(1);
        transition: transform 100ms;
    }

    .label {
        position: relative;
        top: 2px;
        color: ${({ theme }) => theme.primaryText};
    }
`;