import styled from 'styled-components';
export const StyledContactInfo = styled.li`
    list-style-type: none;
    border: 3px solid white;
    border-radius: 5px;

    .contact-header {
        background-color: ${({ theme }) => theme.bodyPrimary};
        padding: 10px;
        font-size: 1.5em;
        text-align: center;
    }

    .hours-content-div {
        text-align: left;
        display: inline-block;
    }

    .phone {
        font-size: inherit;
        vertical-align: middle;
        display: inline-block;
        width: 40px;
        height: 40px;
        fill: white;
    }

    td {
        border: 1px solid white;
    }
`;