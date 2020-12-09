import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    body {
        background: ${({ theme }) => theme.bodyPrimary};
        color: ${({ theme }) => theme.textPrimary};
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
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
`