import styled from 'styled-components';

export const StyledCollapsible = styled.header`
    .header{
        display: block;
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
        display: inline-block;
        width: 0;
        height: 0;
        border: 5px solid transparent;
        ${({ is_open, theme }) => is_open? `border-bottom: 5px solid ${theme.textPrimary}` : `border-top: 5px solid ${theme.textPrimary}`};
        content: ' ';
        position: absolute;
        right: 10px;
        margin-top: ${({ is_open }) => is_open? '0px' : '5px'};
    }
`;