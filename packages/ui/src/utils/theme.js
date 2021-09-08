import { createTheme } from '@material-ui/core/styles';

const commonTheme = createTheme({
    components: {
        // Style sheet name ⚛️
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
            light: '#4c8c4a',
            main: '#1b5e20',
            dark: '#003300',
        },
        secondary: {
            light: '#63a4ff',
            main: '#1976d2',
            dark: '#004ba0',
        },
        background: {
            default: '#dae7da',
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
            light: '#8e8e8e',
            main: '#616161',
            dark: '#373737',
        },
        secondary: {
            light: '#80e27e',
            main: '#4caf50',
            dark: '#087f23',
        },
        background: {
            default: '#000000',
            paper: '#212121',
            textPrimary: '#ffffff',
            textSecondary: '#c3c3c3',
        },
    }
})

export const themes = {
    'light': lightTheme,
    'dark': darkTheme
}