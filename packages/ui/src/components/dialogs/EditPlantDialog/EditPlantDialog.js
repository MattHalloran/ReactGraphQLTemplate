import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {  
    AppBar,   
    Button,
    Dialog, 
    Grid,
    IconButton,
    List, 
    ListItem, 
    ListItemText, 
    ListSubheader,
    Slide,
    TextField,
    Toolbar,   
    Tooltip
} from '@material-ui/core';
import {
    AddBox as AddBoxIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Restore as RestoreIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { modifyPlant } from 'query/http_promises';
import { NoImageIcon } from 'assets/img';
import { Selector } from 'components';
import { 
    deleteArrayIndex,
    displayPrice, 
    displayPriceToDatabase,
    lightTheme,
    makeID,
    PUBS,
    PubSub,
    updateArray
} from 'utils';
// import { DropzoneAreaBase } from 'material-ui-dropzone';
import _ from 'underscore';

const PLANT_ATTRIBUTES = [
    'Drought Tolerance',
    'Grown Height',
    'Grown Spread',
    'Growth Rate',
    'Optimal Light',
    'Salt Tolerance',
]

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    container: {
        // padding: theme.spacing(1),
        padding: lightTheme.spacing(1),
    },
    sideNav: {
        width: '25%',
        height: '100%',
        float: 'left',
        //borderRight: `2px solid ${theme.palette.primary.contrastText}`,
        borderRight: `2px solid ${lightTheme.palette.primary.contrastText}`,
    },
    optionsContainer: {
        // padding: theme.spacing(2),
        padding: lightTheme.spacing(2),
    },
    displayImage: {
        border: '1px solid black',
        maxWidth: '100%',
        maxHeight: '100%',
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
        //background: theme.palette.primary.light,
        background: lightTheme.palette.primary.light,
        //color: theme.palette.primary.contrastText,
        color: lightTheme.palette.primary.contrastText,
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function EditPlantDialog({
    plant,
    trait_options,
    open = true,
    onClose,
}) {
    console.log('PLANT POPUP', plant)
    const classes = useStyles();
    const [changedPlant, setChangedPlant] = useState(plant);

    // Used for display image upload
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedSkuIndex, setSelectedSkuIndex] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(PLANT_ATTRIBUTES[0])

    useEffect(() => {
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
        setChangedPlant(plant);
    }, [plant])

    function revertPlant() {
        setChangedPlant(plant);
    }

    const savePlant = () => {
        let plant_data = {
            ...changedPlant,
            display_image: selectedImage,
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        modifyPlant('UPDATE', plant_data)
            .then(() => {
                PubSub.publish(PUBS.Snack, { message: 'SKU Updated.' });
            })
            .catch((error) => {
                console.error(error);
                PubSub.publish(PUBS.Snack, { message: 'Failed to update SKU.', severity: 'error' });
            });
    }

    function updatePlantField(field, value) {
        console.log('UPDATING PLANT FIELD', field, value)
        setChangedPlant(p => ({
            ...p,
            [field]: value,
        }));
    }

    function updateSkuField(field, value) {
        console.log('UPDATING SKU FIELD', field, value, selectedSkuIndex)
        if (selectedSkuIndex < 0) return;
        setChangedPlant(p => {
            let skus_list = p.skus;
            let new_sku = skus_list[selectedSkuIndex];
            new_sku[field] = value
            skus_list = updateArray(skus_list, selectedSkuIndex, new_sku);
            return ({
                ...p,
                skus: skus_list,
            })
        });
    }

    useEffect(() => {
        console.log('changed plant is:::::', changedPlant);
    }, [changedPlant])

    function getSelector(label, field, multiSelect = false) {
        console.log('IN SELECTORRRRRR', field, plant)
        return (
            <Selector
                fullWidth
                size="small"
                options={trait_options ? trait_options[field] : []}
                selected={changedPlant ? changedPlant[field] : null}
                handleChange={(e) => updatePlantField(field, e.target.value)}
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
                value={changedPlant ? changedPlant[field] : null}
                onChange={e => updatePlantField(field, e.target.value)}
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
        setChangedPlant(p => ({
            ...p,
            skus: p.skus.concat({ sku: makeID(10) }),
        }));
    }

    function removeSku() {
        if (selectedSkuIndex < 0) return;
        setChangedPlant(p => ({
            ...p,
            skus: deleteArrayIndex(p.skus, selectedSkuIndex),
        }));
    }

    //Show display image from uploaded image.
    //If no upload image, from model data.
    //If not model data, show NoImageIcon
    let image_data = selectedImage?.data ?? changedPlant?.displayImage;
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

    let changes_made = !_.isEqual(plant, changedPlant);
    let options = (
        <Grid className={classes.optionsContainer} container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<RestoreIcon />}
                    onClick={revertPlant}
                >Revert</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<UpdateIcon />}
                    onClick={savePlant}
                >Update</Button>
            </Grid>
        </Grid>
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
                        {plant?.skus.map((s, index) => (
                            <ListItem
                                button
                                className={`sku-option ${index === selectedSkuIndex ? classes.selected : ''}`}
                                onClick={() => setSelectedSkuIndex(changedPlant?.skus?.indexOf(s) ?? -1)}>
                                <ListItemText primary={s.sku} />
                            </ListItem>
                        ))}
                    </List>
                    <div>
                        {selectedSkuIndex >= 0 ?
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
                                value={changedPlant?.latin_name}
                                onChange={e => updatePlantField('latin_name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Common Name"
                                value={changedPlant?.common_name}
                                onChange={e => updatePlantField('common_name', e.target.value)}
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
                            {/* <DropzoneAreaBase
                                acceptedFiles={['image/*']}
                                dropzoneText={"Drag and drop new images here or click"}
                                onChange={fileSelectedHandler}
                                showAlerts={false}
                                filesLimit={1}
                                classes={{
                                    root: classes.imageRow,
                                }}
                            /> */}
                        </Grid>
                    </Grid>
                    <h3>Edit SKU info</h3>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                label="Plant Code"
                                value={changedPlant ? changedPlant.skus[selectedSkuIndex]?.sku : null}
                                onChange={e => updateSkuField('sku', e.target.value)}
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
                                value={changedPlant ? displayPrice(changedPlant.skus[selectedSkuIndex]?.price) : null}
                                onChange={e => updateSkuField('price', displayPriceToDatabase(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                label="Quantity"
                                value={changedPlant ? changedPlant.skus[selectedSkuIndex]?.quantity : null}
                                onChange={e => updateSkuField('quantity', e.target.value)}
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
    sku: PropTypes.object.isRequired,
    trait_options: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { EditPlantDialog };