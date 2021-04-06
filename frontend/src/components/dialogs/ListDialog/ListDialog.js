import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { blue } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.background.paper,
    },
    title: {
        background: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
}));

function ListDialog({
    open = true,
    onClose,
    title = 'Select Item',
    data,
    ...props
}) {
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
                {data?.map(([label, value], index) => (
                    <ListItem button onClick={() => onClose(value)} key={index}>
                        <ListItemText primary={label} />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export default ListDialog;