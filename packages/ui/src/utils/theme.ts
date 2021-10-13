import { createTheme } from '@material-ui/core/styles';

declare module '@material-ui/core/styles' {
    interface Theme {
        palette: {
            mode: string;
            primary: {
                light: string;
                main: string;
                dark: string;
            },
            secondary: {
                light: string;
                main: string;
                dark: string;
            },
            background: {
                default: string;
                paper: string;
                textPrimary: string;
                textSecondary: string;
            },
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

const commonTheme = createTheme({
    components: {
        MuiButton: {
            defaultProps: {
                variant: 'contained',
                color: 'secondary',
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined'
            },
        },
    },
});

const lightTheme = createTheme({
    ...commonTheme,
    palette: {
        mode: 'light',
        primary: {
            light: '#4446a2',
            main: '#344eb5',
            dark: '#002784',
        },
        secondary: {
            light: '#c8ffa5',
            main: '#96d175',
            dark: '#66a047',
        },
        background: {
            default: '#e9ebf1',
            paper: '#ffffff',
            textPrimary: '#000000',
            textSecondary: '#6f6f6f',
        },
    }
})

const darkTheme = createTheme({
    ...commonTheme,
    palette: {
        mode: 'dark',
        primary: {
            light: '#39676d',
            main: '#073c42',
            dark: '#00171b',
        },
        secondary: {
            light: '#b5ffec',
            main: '#83d1ba',
            dark: '#52a08a',
        },
        background: {
            default: '#000000',
            paper: '#212121',
            // @ts-expect-error
            textPrimary: '#ffffff',
            textSecondary: '#c3c3c3',
        },
    }
})

export const themes = {
    'light': lightTheme,
    'dark': darkTheme
}