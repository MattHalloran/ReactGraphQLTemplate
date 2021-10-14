import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Theme
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        background: theme.palette.background.paper,
    },
    title: {
        background: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
}));

interface ListItemData {
    label: string;
    value: string;
}

interface Props {
    open?: boolean;
    onClose: (value?: string) => void;
    title?: string;
    data: ListItemData[];
}

const ListDialog = ({
    open = true,
    onClose,
    title = 'Select Item',
    data,
    ...props
}: Props) => {
    const classes = useStyles();

    return (
        <Dialog
            PaperProps={{
                className: classes.root,
            }}
            onClose={() => onClose()}
            aria-labelledby="simple-dialog-title"
            open={open}
            {...props}>
            <DialogTitle className={classes.title} id="simple-dialog-title">{title}</DialogTitle>
            <List>
                {data?.map(({ label, value }, index) => (
                    <ListItem button onClick={() => onClose(value)} key={index}>
                        <ListItemText primary={label} />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export { ListDialog };