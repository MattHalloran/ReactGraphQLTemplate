import styled from 'styled-components';

export const StyledCollapsible = styled.header`
    .header{
    cursor: pointer;
    border: solid 1px #f2f2f2;
    padding: 15px;
    background-color: #0089CC;
    color: #FFF;
    font-family: verdana;
    }

    .content{
        cursor: pointer;
        border-left: solid 1px #f2f2f2;
        border-right: solid 1px #f2f2f2;
        border-bottom: solid 1px #f2f2f2;
        border-radius: 0 0 5px 5px;
        padding: 15px;
        font-family: verdana;
        font-size: 14px;
        display: flex;
        -webkit-box-pack: justify;
        -webkit-justify-content: space around;
        justify-content: space-around;

        > * {
            display: inline-block;
            text-align: center;
        }
    }

    .arrow-wrapper {
        position: relative;
    }

    .arrow {
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