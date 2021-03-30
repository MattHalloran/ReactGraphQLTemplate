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
            dark: '#003300'
        },
        secondary: {
            light: '#67daff',
            main: '#03a9f4',
            dark: '#007ac1'
        }
    }
})

export const darkTheme = createMuiTheme({
    ...commonTheme,
    palette: {
        type: 'light',
        primary: {
            light: '#4c8c4a',
            main: '#1b5e20',
            dark: '#003300'
        },
        secondary: {
            light: '#67daff',
            main: '#03a9f4',
            dark: '#007ac1'
        }
    }
})