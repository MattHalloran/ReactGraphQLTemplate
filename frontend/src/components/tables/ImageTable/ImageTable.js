import { Component, useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { Button, Grid, Checkbox, TextField, TableContainer, Table, TableBody, TableCell, TableRow, Paper } from '@material-ui/core';
import { NoImageIcon } from 'assets/img';
import {
    EnhancedTableHead,
    EnhancedTableToolbar
} from 'components';
import { makeStyles } from '@material-ui/styles';
import { updateArray } from "utils/arrayTools";
import { lightTheme } from "utils";

const useStyles = makeStyles((theme) => ({
    image: {
        height: 150,
        width: 'fit-content',
        objectFit: 'cover',
    },
    padBottom: {
        // marginBottom: theme.spacing(2),
        marginBottom: lightTheme.spacing(2),
    },
    gridItem: {
        display: 'flex',
    },
    orderField: {
        maxWidth: 75,
    },
}));

// Data must be an array of the following:
// src - string
// alt - string
// description - string
// position - number
function ImageTable({
    title = 'Image Data',
    data = [],
    onUpdate,
    onApply,
}) {
    console.log('IMAGE TABLE RENDER', data)
    const classes = useStyles();
    const [selected, setSelected] = useState([]);
    const [changed, setChanged] = useState([]);

    useEffect(() => {
        console.log("DATA UPDATEDDD", data)
        // If data is empty, endless rerenders can occur. Not sure why
        setChanged(c => data.length === 0 && c.length === 0 ? c : data);
    }, [data])

    const handleSelectAllClick = (event) => {
        console.log('IN SELECT ALL CLICK')
        if (event.target.checked) {
            const newSelecteds = changed.map((i) => i.pos);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = useCallback((index) => {
        let select = [...selected];
        const pos = select.indexOf(index);
        pos === -1 ? select.push(index) : select.splice(pos, 1);
        setSelected(select);
    }, [selected]);

    const headCells = [
        { id: 'order', align: 'left', disablePadding: true, label: 'Order' },
        { id: 'image', align: 'left', disablePadding: true, label: 'Image' },
        { id: 'title', align: 'right', disablePadding: false, label: 'Title' },
        { id: 'description', align: 'right', disablePadding: false, label: 'Description' },
    ]

    function removeItems() {
        let new_data = [];
        console.log('starting remove items', selected)
        for (let i = 0; i < changed.length; i++) {
            (selected.indexOf(changed[i].pos) < 0) && new_data.push(changed[i]);
        }
        console.log('SETTING NEW DATA ', new_data)
        onUpdate(new_data);
    }

    function revertChanges() {
        console.log('REVERTING CHANGES')
        setChanged(data);
    }

    function updateField(index, field, value) {
        console.log('UPDATING FIELD')
        let data_row = { ...changed[index] };
        data_row[field] = value;
        console.log('updating changed', index, data_row)
        setChanged(c => updateArray(c, index, data_row));
    }

    let options = (
        <Grid classes={{ container: classes.padBottom }} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={() => onApply(changed)}>Apply Changes</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={6}>
                <Button fullWidth onClick={revertChanges}>Revert Changes</Button>
            </Grid>
        </Grid>
    )

    return (
        <div>
            { options}
            <EnhancedTableToolbar
                title={title}
                numSelected={selected.length}
                onDelete={removeItems} />
            <TableContainer classes={{ root: classes.padBottom }} component={Paper}>
                <Table>
                    <EnhancedTableHead
                        headCells={headCells}
                        numSelected={selected.length}
                        onSelectAllClick={handleSelectAllClick}
                        rowCount={changed.length}
                    />
                    <TableBody>
                        {changed.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell padding="checkbox" onClick={() => handleClick(index)}>
                                    <Checkbox
                                        checked={selected.indexOf(index) !== -1}
                                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${index}` }}
                                    />
                                </TableCell>
                                <TableCell scope="row">
                                    <TextField
                                        // className={classes.orderField}
                                        fullWidth
                                        type="number"
                                        label="Order"
                                        value={row.pos}
                                        onChange={e => updateField(index, 'pos', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell align="left">
                                    <img src={data[index].src} alt={row.alt} />
                                </TableCell>
                                <TableCell align="right">
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={row.alt ?? ''}
                                        onChange={e => updateField(index, 'alt', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={row.description ?? ''}
                                        onChange={e => updateField(index, 'description', e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            { options}
        </div>
    )
}

ImageTable.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    onUpdate: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
}

export { ImageTable };