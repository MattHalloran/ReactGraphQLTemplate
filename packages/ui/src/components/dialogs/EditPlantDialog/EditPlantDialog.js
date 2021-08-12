import React, { useState, useEffect, useCallback } from 'react';
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
import { addImagesMutation, deletePlantsMutation, updateImagesMutation, updatePlantMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { NoImageIcon } from 'assets/img';
import { Dropzone, ImageList, Selector } from 'components';
import {
    deleteArrayIndex,
    displayPrice,
    displayPriceToDatabase,
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
        padding: theme.spacing(1),
    },
    sideNav: {
        width: '25%',
        height: '100%',
        float: 'left',
        borderRight: `2px solid ${theme.palette.primary.contrastText}`,
    },
    optionsContainer: {
        padding: theme.spacing(2),
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
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
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
    const [updatePlant] = useMutation(updatePlantMutation);
    const [deletePlant] = useMutation(deletePlantsMutation);

    const [imageData, setImageData] = useState([]);
    const [addImages] = useMutation(addImagesMutation);
    const [updateImages] = useMutation(updateImagesMutation);

    const uploadImages = (acceptedFiles) => {
        PubSub.publish(PUBS.Loading, true);
        addImages({
            variables: {
                files: acceptedFiles,
                labels: ['hero']
            }
        })
            .then((response) => {
                //refetchImages(); TODO
                PubSub.publish(PUBS.Snack, { message: `Successfully uploaded ${acceptedFiles.length} image(s)`, data: response });
                PubSub.publish(PUBS.Loading, false);
            })
            .catch((response) => {
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
            })
    }

    const applyChanges = useCallback((changed) => {
        PubSub.publish(PUBS.Loading, true);
        // Prepare data for request
        const data = changed.map(d => ({
            src: d.src,
            alt: d.alt,
            description: d.description
        }));
        // Determine which files to mark as deleting
        const original_srcs = imageData.map(d => d.src);
        const final_srcs = changed.map(d => d.src);
        const delete_srcs = original_srcs.filter(s => !final_srcs.includes(s));
        // Perform update
        updateImages({
            variables: {
                data: data,
                deleting: delete_srcs
            }
        })
            .then((response) => {
                PubSub.publish(PUBS.Snack, { message: `Successfully updated images`, data: response });
                PubSub.publish(PUBS.Loading, false);
            })
            .catch((response) => {
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
            })
    }, [imageData, updateImages])

    const [selectedSkuIndex, setSelectedSkuIndex] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(PLANT_ATTRIBUTES[0]);

    useEffect(() => {
        setChangedPlant({
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
        });
        setImageData(plant?.images);
    }, [plant])

    function revertPlant() {
        setChangedPlant(plant);
    }

    const confirmDelete = useCallback(() => {
        PubSub.publish(PUBS.AlertDialog, {
            message: `Are you sure you want to delete this plant, along with its SKUs? This cannot be undone`,
            firstButtonText: 'Yes',
            firstButtonClicked: () => {
                deletePlant({ variables: { ids: [changedPlant.id] } })
                    .then(() => {
                        PubSub.publish(PUBS.Snack, { message: 'Plant deleted' });
                        onClose();
                    })
                    .catch((error) => {
                        PubSub.publish(PUBS.Snack, { message: 'Failed to delete plant', severity: 'error', data: error });
                    });
            },
            secondButtonText: 'No',
        });
    }, [changedPlant, deletePlant, onClose])

    const savePlant = () => {
        let plant_data = {
            ...changedPlant,
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        updatePlant({ variables: { input: plant_data } })
            .then(() => {
                PubSub.publish(PUBS.Snack, { message: 'SKU Updated.' });
            })
            .catch((error) => {
                PubSub.publish(PUBS.Snack, { message: 'Failed to update SKU.', severity: 'error', data: error });
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
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<DeleteIcon />}
                    onClick={revertPlant}
                >Revert</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changedPlant?.id}
                    startIcon={<RestoreIcon />}
                    onClick={confirmDelete}
                >Delete</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
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
                        <h3>Edit images</h3>
                        {/* Upload new images */}
                        <Grid item xs={12}>
                            <Dropzone
                                dropzoneText={'Drag \'n\' drop new images here or click'}
                                onUpload={uploadImages}
                                uploadText='Upload Images'
                                cancelText='Cancel Upload'
                            />
                        </Grid>
                        {/* And edit existing images */}
                        <Grid item xs={12}>
                            <ImageList data={imageData} onApply={applyChanges} />
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
                                label="Availability"
                                value={changedPlant ? changedPlant.skus[selectedSkuIndex]?.availability : null}
                                onChange={e => updateSkuField('availability', e.target.value)}
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