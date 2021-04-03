import { createMuiTheme } from '@material-ui/core/styles';

const commonTheme = createMuiTheme({
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

export const lightTheme = createMuiTheme({
    ...commonTheme,
    palette: {
        type: 'light',
        primary: {
            light: '#4c8c4a',
            main: '#1b5e20',
            dark: '#003300',
        },
        secondary: {
            light: '#67daff',
            main: '#03a9f4',
            dark: '#007ac1',
        },
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
    }
})

export const darkTheme = createMuiTheme({
    ...commonTheme,
    palette: {
        type: 'dark',
        primary: {
            light: '#358461',
            main: '#1c2d25',
            dark: '#0f2119',
        },
        secondary: {
            light: '#6195d6',
            main: '#295ea0',
            dark: '#0e3667',
        },
        background: {
            default: '#303030',
            paper: '#424242',
        },
    }
})