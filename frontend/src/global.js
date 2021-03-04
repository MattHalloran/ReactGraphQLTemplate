import { createGlobalStyle } from 'styled-components';

// Removes scrolling from App when menu is open,
// so only the menu scrolls
const menu_app_style = `position: fixed; 
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    width: 100%; 
    overflow: hidden;
`

export const GlobalStyles = createGlobalStyle`

    body {
        background: ${({ theme }) => theme.backgroundColor};
        box-shadow: inset 0 0 6vw 3vw rgb(0 0 0 / 10%);
        color: ${({ theme }) => theme.primaryText};
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
  
    code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    }

    a {
        transition: color 0.3s linear;
        text-decoration: none;
    }
    a:hover {
        color: ${({ theme }) => theme.secondaryText};
        text-decoration: none;
    }

    a:link,
    a:visited {
        color: ${({ theme }) => theme.primaryText};
    }

    #App {
        text-align: center;
        ${({ menu_or_popup_open }) => menu_or_popup_open ? menu_app_style : ''};
    }
    
    #page-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    #content-wrap{
        flex:1;
        position: relative;
        min-height: 100vh;
    }

    .card {
        background: ${({ theme }) => theme.cardColor};
        color: ${({ theme }) => theme.headerText};
        overflow: hidden;
    }

    .header {
        display: grid;
        background: ${({ theme }) => theme.darkPrimaryColor};
        color: ${({ theme }) => theme.headerText};
    }

    .content {
        padding: 0 10px;
    }

    .page {
        background: ${({ theme }) => theme.lightPrimaryColor};
        min-height: 100vh;
        margin-top: 15vh;
        margin-left: 1vw;
        margin-right: 1vw;
        margin-bottom: 2vh;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    }

    .icon-container {
        display: flex;
        justify-content: space-between;

        > svg, img {
            display: inline-block;
            text-align: center;
            stroke: none;
            fill: ${({ theme }) => theme.headerText};
            cursor: pointer;
        }
    }
`