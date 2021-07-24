import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { Delete as DeleteIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    highlight: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
    title: {
        flex: '1 1 100%',
    },
    icon: {
        fill: theme.palette.primary.contrastText,
    },
}));

function EnhancedTableToolbar({
    title,
    numSelected = 0,
    onDelete,
}) {
    const classes = useStyles();

    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            {numSelected > 0 ? (
                <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
                    {title}
                </Typography>
            )}

            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton onClick={onDelete} aria-label="delete">
                        <DeleteIcon className={classes.icon} />
                    </IconButton>
                </Tooltip>
            ) : null}
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    title: PropTypes.string.isRequired,
    numSelected: PropTypes.number,
    onDelete: PropTypes.func.isRequired,
};

export { EnhancedTableToolbar };