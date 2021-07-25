import React from 'react';
import PropTypes from 'prop-types';
import { TableCell, TableHead, TableRow, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    check: {
        color: theme.palette.primary.contrastText,
    },
    cell: {
        color: theme.palette.primary.contrastText,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

const exampleCells = [
    { id: 'name', align: 'left', disablePadding: true, label: 'Dessert (100g serving)' },
    { id: 'calories', align: 'right', disablePadding: false, label: 'Calories' },
    { id: 'fat', align: 'right', disablePadding: false, label: 'Fat (g)' },
    { id: 'carbs', align: 'right', disablePadding: false, label: 'Carbs (g)' },
    { id: 'protein', align: 'right', disablePadding: false, label: 'Protein (g)' },
];

function EnhancedTableHead({
    headCells = exampleCells,
    numSelected = 0,
    rowCount,
    onSelectAllClick,
}) {
    const classes = useStyles();

    return (
        <TableHead className={classes.root}>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        className={classes.check}
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{ 'aria-label': 'select all desserts' }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align ?? 'left'}
                        className={classes.cell}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    headCells: PropTypes.array,
    numSelected: PropTypes.number,
    onSelectAllClick: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
};

export { EnhancedTableHead };