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
        background: ${({ theme }) => theme.bodyPrimary};
        color: ${({ theme }) => theme.textPrimary};
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
  
    code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
            monospace;
    }
    /* Primary (default) link settings */
    a {
        transition: color 0.3s linear;
        text-decoration: none;
    }
    a:link {
        color: ${({ theme }) => theme.textPrimary};
    }
    a:visited {
        color: ${({ theme }) => theme.textPrimary};
    }
    a:hover {
        color: ${({ theme }) => theme.hoverPrimary};
        text-decoration: none;
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
    }
    
    @keyframes App-logo-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
    }
    
    button.primary {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        padding: 16px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        transition-duration: 0.4s;
        cursor: pointer;
        border-radius: 10px;
    }
`