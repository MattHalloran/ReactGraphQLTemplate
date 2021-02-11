import styled from 'styled-components';

export const StyledCollapsible = styled.header`
    .header{
    cursor: pointer;
    border-style: solid;
    border-top: solid 2px black;
    border-bottom: solid 2px black;
    border-left: 0;
    border-right: 0;
    padding: 15px;
    background-color: ${({ theme }) => theme.bodySecondary};
    box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, .6);
    color: #FFF;
    font-family: verdana;
    }

    .content{
        
    }

    .collapse-arrow-wrapper {
        position: relative;
    }

    .collapse-arrow {
        border-color: black transparent transparent;
        border-style: solid;
        border-width: 5px 5px 0;
        content: ' ';
        display: block;
        height: 0;
        position: absolute;
        right: 10px;
        top: -11px;
        width: 0
    }
`;