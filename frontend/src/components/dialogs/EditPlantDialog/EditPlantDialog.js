import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSession } from 'utils/storage';
import { makeStyles } from '@material-ui/core/styles';
import { modifyPlant } from 'query/http_promises';
import { Dialog, AppBar, Toolbar, IconButton, Slide, Container, Tooltip, Grid, TextField, Button, List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import { NoImageIcon } from 'assets/img';
import Selector from 'components/inputs/Selector/Selector';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { displayPrice, displayPriceToDatabase } from 'utils/displayPrice';
import makeID from 'utils/makeID';
import { PLANT_ATTRIBUTES } from 'utils/consts';
import { DropzoneAreaBase } from 'material-ui-dropzone';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    container: {
        padding: theme.spacing(1),
    },
    sideNav: {
        width: '25%',
        height: '100%',
        float: 'left',
        borderRight: `2px solid ${theme.palette.primary.contrastText}`,
    },
    optionsContainer: {
        width: 'fit-content',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    displayImage: {
        border: '1px solid black',
        maxWidth: '100%',
        maxWidth: '-webkit-fill-available',
        maxHeight: '100%',
        maxHeight: '-webkit-fill-available',
        bottom: 0,
    },
    content: {
        width: '75%',
        height: '100%',
        float: 'right',
    },
    imageRow: {
        minHeight: '100px',
    },
    selected: {

    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function EditPlantDialog({
    session = getSession(),
    plant,
    trait_options,
    open = true,
    onClose,
}) {
    console.log('PLANT POPUP', plant)
    const classes = useStyles();
    plant = {
        ...plant,
        skus: plant?.skus ?? [],
        latin_name: plant?.latin_name ?? '',
        common_name: plant?.common_name ?? '',
        drought_tolerance: plant?.drought_tolerance ?? '',
        grown_height: plant?.grown_height ?? '',
        grown_spread: plant?.grown_spread ?? '',
        growth_rate: plant?.growth_rate ?? '',
        optimal_light: plant?.optimal_light ?? '',
        salt_tolerance: plant?.salt_tolerance ?? '',
    };
    console.log('PLANT ISSSSSSS', plant)

    // Used for display image upload
    const [selectedImage, setSelectedImage] = useState(null);
    // Used to display selected SKU info
    const [selectedSku, setSelectedSku] = useState({
        code: '',
        size: '',
        price: '',
        quantity: '',
    });
    const [selectedAttribute, setSelectedAttribute] = useState(PLANT_ATTRIBUTES[0])

    const savePlant = () => {
        let plant_data = {
            ...plant,
            display_image: selectedImage,
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        modifyPlant(session, 'UPDATE', plant_data)
            .then(() => {
                alert('SKU Updated!')
            })
            .catch((error) => {
                console.error(error);
                alert('Failed to update SKU!')
            });
    }

    function getSelector(label, field, multiSelect = false) {
        console.log('IN SELECTORRRRRR', field, plant)
        return (
            <Selector
                fullWidth
                size="small"
                options={trait_options ? trait_options[field] : []}
                selected={plant[field]}
                handleChange={(e) => plant[field] = e.target.value}
                inputAriaLabel={`plant-attribute-${field}-selector-label`}
                label={label}
                multiple={multiSelect} />
        )
    }

    function getTextField(label, field) {
        return (
            <TextField
                fullWidth
                size="small"
                id={field}
                label={label}
                value={plant[field]}
                onChange={e => plant[field] = e.target.value}
            />
        )
    }

    const fileSelectedHandler = (files) => {
        if (files.length === 0) return;
        let file = files[0]
        let fileSplit = file.name.split('.');
        processImage(file, fileSplit[0], fileSplit[1]);
    }

    const processImage = (file, name, extension) => {
        let reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage({
                name: name,
                extension: extension,
                data: reader.result
            });
        }
        reader.readAsDataURL(file);
    }

    function newSku() {
        plant.skus = plant.skus.concat({ sku: makeID(10) });
    }

    function removeSku() {
        if (plant.skus.indexOf(selectedSku) < 0) return;
        plant.skus = plant.skus.filter(s => s.sku !== selectedSku.sku);
    }

    //Show display image from uploaded image.
    //If no upload image, from model data.
    //If not model data, show NoImageIcon
    let image_data = selectedImage?.data ?? plant.displayImage;
    let display_image;
    if (image_data) {
        display_image = <img src={image_data} className={classes.displayImage} alt="TODO" />
    } else {
        display_image = <NoImageIcon className={classes.displayImage} />
    }

    const attribute_meta = {
        'Drought Tolerance': ['drought_tolerance'],
        'Grown Height': ['grown_height'],
        'Grown Spread': ['grown_spread'],
        'Growth Rate': ['growth_rate'],
        'Optimal Light': ['optimal_light'],
        'Salt Tolerance': ['salt_tolerance'],
        'Size': ['size'],
    }

    let options = (
        <Container className={classes.optionsContainer}>
            <Button onClick={savePlant}>Apply Changes</Button>
        </Container>
    );

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    {options}
                </Toolbar>
            </AppBar>
            <div className={classes.container}>
                <div className={classes.sideNav}>
                    <List
                        aria-label="sku select"
                        aria-labelledby="sku-select-subheader">
                        <ListSubheader component="div" id="sku-select-subheader">
                            SKUs
                </ListSubheader>
                        {plant.skus.map(s => (
                            <ListItem
                                button
                                className={`sku-option ${s === selectedSku ? 'selected' : ''}`}
                                onClick={() => setSelectedSku(s)}>
                                <ListItemText primary={s.sku} />
                            </ListItem>
                        ))}
                    </List>
                    <div>
                        {selectedSku ?
                            <Tooltip title="Delete SKU">
                                <IconButton onClick={removeSku}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            : null}
                        <Tooltip title="New SKU">
                            <IconButton onClick={newSku}>
                                <AddBoxIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <div className={classes.content}>
                    <h3>Edit plant info</h3>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Latin Name"
                                value={plant.latin_name}
                                onChange={e => plant.latin_name = e.target.value}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Common Name"
                                value={plant.common_name}
                                onChange={e => plant.common_name = e.target.value}
                            />
                        </Grid>
                        {/* Select which attribute you'd like to edit */}
                        <Grid item xs={12}>
                            <Selector
                                fullWidth
                                size="small"
                                options={PLANT_ATTRIBUTES}
                                selected={selectedAttribute}
                                handleChange={(e) => setSelectedAttribute(e.target.value)}
                                inputAriaLabel={"plant-attribute-select-label"}
                                label={"Select attribute to edit"} />
                        </Grid>
                        {/* Pick from existing entries... */}
                        <Grid item xs={6}>
                            {getSelector('Existing value', ...attribute_meta[selectedAttribute])}
                        </Grid>
                        {/* ...or enter a custom value */}
                        <Grid item xs={6}>
                            {getTextField('New value', ...attribute_meta[selectedAttribute])}
                        </Grid>
                        {/* Display existing display image */}
                        <Grid item xs={3}>
                            <div className={classes.imageRow}>
                                <p>Display Image</p>
                                {display_image}
                            </div>
                        </Grid>
                        {/* Replace display image */}
                        <Grid item xs={9}>
                            <DropzoneAreaBase
                                acceptedFiles={['image/*']}
                                dropzoneText={"Drag and drop new images here or click"}
                                onChange={fileSelectedHandler}
                                showAlerts={false}
                                filesLimit={1}
                                classes={{
                                    root: classes.imageRow,
                                }}
                            />
                        </Grid>
                    </Grid>
                    <h3>Edit SKU info</h3>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                label="Plant Code"
                                value={selectedSku.code}
                                onChange={e => selectedSku.code = e.target.value}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            {getSelector('Existing size', ...attribute_meta['Size'])}
                        </Grid>
                        <Grid item xs={6}>
                            {getTextField('New size', ...attribute_meta['Size'])}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Price"
                                value={selectedSku.price}
                                onChange={e => selectedSku.price = e.target.value}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Quantity"
                                value={selectedSku.quantity}
                                onChange={e => selectedSku.quantity = e.target.value}
                            />
                        </Grid>
                    </Grid>
                </div>
                {options}
            </div>
        </Dialog>
    );
}

EditPlantDialog.propTypes = {
    session: PropTypes.object,
    sku: PropTypes.object.isRequired,
    trait_options: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export default EditPlantDialog;