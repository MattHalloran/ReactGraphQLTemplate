import styled from 'styled-components';

export const StyledDots = styled.div`
    position: absolute;
    bottom: 25px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .dot {
        padding: 10px;
        margin-right: 5px;
        cursor: pointer;
        border-radius: 50%;
        opacity: 80%;
    }

    .active {
        background-color: ${({ theme }) => theme.primaryColor};
        opacity: 0.9;
        border: 1px solid ${({ theme }) => theme.textPrimary};
    }

    .inactive {
        background: white;
        border: 1px solid black;
    }
`;