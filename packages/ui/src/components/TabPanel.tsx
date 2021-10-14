import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.background.paper,
    },
}));

interface Props {
    children: React.ReactNode,
    index: number | string,
    value: number | string,
}

export const TabPanel: React.FC<Props> = (props) => {
    const classes = useStyles();
    const { children, value, index, ...other } = props;

    return (
        <div
            className={classes.root}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}