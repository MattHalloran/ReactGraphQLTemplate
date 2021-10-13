import { DefaultTheme, Styles } from "@material-ui/styles";

export const cardStyles: Styles<DefaultTheme, {}, string> = (theme: DefaultTheme | {} | string) => ({
    cardRoot: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        cursor: 'pointer',
    },
    content: {
        padding: 8,
        position: 'inherit',
    },
    icon: {
        fill: theme.palette.secondary.light,
    },
});