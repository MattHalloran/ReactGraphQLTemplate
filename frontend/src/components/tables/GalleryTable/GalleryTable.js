import { Component, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Button, Grid, Checkbox, TextField, TableContainer, Table, TableBody, TableCell, TableRow, Paper } from '@material-ui/core';
import { NoImageIcon } from 'assets/img';
import {
    EnhancedTableHead,
    EnhancedTableToolbar
} from 'components';
import { makeStyles } from '@material-ui/core/styles';
import { updateArray } from "utils/arrayTools";

const useStyles = makeStyles((theme) => ({
    image: {
        height: 150,
        width: 'fit-content',
        objectFit: 'cover',
    },
    padBottom: {
        marginBottom: theme.spacing(2),
    },
    gridItem: {
        display: 'flex',
    },
    orderField: {
        maxWidth: 75,
    },
}));

class GalleryRow extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.pos !== nextProps.pos || this.props.alt !== nextProps.alt || this.props.description !== nextProps.description;
    }
    render() {
        const { key, index, pos, image, alt, description, checked, handleClick, updateField } = this.props;
        const display_image = image ? <img src={image} alt={alt} /> : <NoImageIcon />
        return (
            <TableRow key={key}>
                <TableCell padding="checkbox" onClick={() => handleClick(key)}>
                    <Checkbox
                        checked={checked}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${key}` }}
                    />
                </TableCell>
                <TableCell scope="row">
                    <TextField
                        // className={classes.orderField}
                        fullWidth
                        type="number"
                        label="Order"
                        value={pos}
                        onChange={e => updateField(index, 'pos', e.target.value)}
                    />
                </TableCell>
                <TableCell align="left">
                    {display_image}
                </TableCell>
                <TableCell align="right">
                    <TextField
                        fullWidth
                        label="Title"
                        value={alt}
                        onChange={e => updateField(index, 'alt', e.target.value)}
                    />
                </TableCell>
                <TableCell align="right">
                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={e => updateField(index, 'description', e.target.value)}
                    />
                </TableCell>
            </TableRow>
        );
    }
}

function GalleryTable({
    data = [],
    onUpdate,
    onApply,
}) {
    const classes = useStyles();
    const [selected, setSelected] = useState([]);
    const [images, setImages] = useState(data.filter(d => d.src));
    const [changed, setChanged] = useState([]);

    useEffect(() => {
        let imgs = [];
        for (let i = 0; i < data.length; i++) {
            data[i].pos = i;
            imgs.push(data[i].src);
            delete data[i].src;
        }
        setImages(imgs);
        setChanged(data);
    }, [data])

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = changed.map((i) => i.key);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (key) => {
        const selectedIndex = selected.indexOf(key);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, key);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

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
            (selected.indexOf(changed[i].key) < 0) && new_data.push(changed[i]);
        }
        console.log('SETTING NEW DATA ', new_data)
        onUpdate(new_data);
    }

    function revertChanges() {
        onUpdate(data);
    }

    function updateField(index, field, value) {
        let data_row = { ...changed[index] };
        data_row[field] = value;
        console.log('updating changed', index, data_row)
        setChanged(c => updateArray(c, index, data_row));
    }
    console.log('rednering...', changed)

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
                title="Gallery Images"
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
                        {changed.map((item, index) => <GalleryRow {...item} index={index} checked={selected.indexOf(item.key) !== -1} handleClick={handleClick} updateField={updateField} image={images[index]}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            { options}
        </div>
    )
}

GalleryTable.propTypes = {
    data: PropTypes.array,
    onUpdate: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
}

export default GalleryTable;