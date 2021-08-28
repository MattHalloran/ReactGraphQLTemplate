import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    AppBar,
    Autocomplete,
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
import { Dropzone, ImageList } from 'components';
import {
    addToArray,
    deleteArrayIndex,
    getPlantSkuField,
    getPlantTrait,
    makeID,
    PUBS,
    PubSub,
    setPlantSkuField,
    setPlantTrait
} from 'utils';
// import { DropzoneAreaBase } from 'material-ui-dropzone';
import _ from 'underscore';

// Common plant traits, and their corresponding field names
const PLANT_TRAITS = {
    'Attracts Pollinators & Wildlife': 'attractsPollinatorsAndWildlife',
    'Drought Tolerance': 'droughtTolerance',
    'Grown Height': 'grownHeight',
    'Grown Spread': 'grownSpread',
    'Growth Rate': 'growthRate',
    'Light Ranges': 'lightRanges',
    'Optimal Light': 'optimalLight',
    'Salt Tolerance': 'saltTolerance',
    'Soil Moistures': 'soilMoistures',
    'Soil PHs': 'soilPhs',
    'Soil Types': 'soilTypes',
    'Zones': 'zone'
}

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
    console.log('PLANT POPUP', trait_options)
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
            }
        })
            .then((response) => {
                PubSub.publish(PUBS.Snack, { message: `Successfully uploaded ${acceptedFiles.length} image(s)`, data: response });
                PubSub.publish(PUBS.Loading, false);
                setImageData([...imageData, ...response.data.addImages.filter(d => d.success).map(d => {
                    return {
                        hash: d.hash,
                        files: [{ src: d.src }]
                    }
                })])
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
            src: d.hash,
            alt: d.alt,
            description: d.description
        }));
        // Determine which files to mark as deleting
        const originals = imageData.map(d => d.hash);
        const finals = changed.map(d => d.hash);
        const deleting = originals.filter(s => !finals.includes(s));
        // Perform update
        updateImages({ variables: { data, deleting } })
            .then((response) => {
                PubSub.publish(PUBS.Snack, { message: `Successfully updated images`, data: response });
                PubSub.publish(PUBS.Loading, false);
            })
            .catch((response) => {
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
            })
    }, [imageData, updateImages])

    const [selectedSkuIndex, setSelectedSkuIndex] = useState(-1);
    const [selectedTrait, setSelectedTrait] = useState(PLANT_TRAITS[0]);

    useEffect(() => {
        setChangedPlant({ ...plant });
        if (Array.isArray(plant?.images)) {
            setImageData(plant.images.map((d, index) => ({
                ...d.image,
                pos: index
            })));
        } else {
            setImageData(null);
        }
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

    const savePlant = useCallback(() => {
        console.log("SAVING PLANTTTTT")
        let plant_data = {
            id: changedPlant.id,
            latinName: changedPlant.latinName,
            traits: changedPlant.traits.map(t => {
                return { name: t.name, value: t.value }
            }),
            skus: changedPlant.skus.map(s => {
                return { sku: s.sku, isDiscountable: s.isDiscountable, size: s.size, note: s.note, availability: parseInt(s.availability) || 0, price: s.price, status: s.status }
            }),
            images: imageData.map(d => {
                return { hash: d.hash, src: d.src, alt: d.alt, description: d.description }
            })
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        updatePlant({ variables: { input: plant_data } })
            .then(() => {
                PubSub.publish(PUBS.Snack, { message: 'SKU Updated.' });
            })
            .catch((error) => {
                PubSub.publish(PUBS.Snack, { message: 'Failed to update SKU.', severity: 'error', data: error });
            });
    }, [changedPlant, imageData, updatePlant])

    const updateTrait = useCallback((traitName, value, createIfNotExists) => {
        const updatedPlant = setPlantTrait(traitName, value, changedPlant, createIfNotExists);
        console.log('UPDATE TRAITTTT', traitName, value, updatedPlant)
        if (updatedPlant) setChangedPlant(updatedPlant);
    }, [changedPlant])

    const updateSkuField = useCallback((fieldName, value) => {
        console.log('IN UPDATE SKU FIELD', fieldName, value);
        const updatedPlant = setPlantSkuField(fieldName, selectedSkuIndex, value, changedPlant);
        console.log('yope', updatedPlant)
        if (updatedPlant) setChangedPlant(updatedPlant)
    }, [changedPlant, selectedSkuIndex])

    function newSku() {
        setChangedPlant(p => ({
            ...p,
            skus: addToArray(p.skus, { sku: makeID(10) }),
        }));
    }

    function removeSku() {
        if (selectedSkuIndex < 0) return;
        setChangedPlant(p => ({
            ...p,
            skus: deleteArrayIndex(p.skus, selectedSkuIndex),
        }));
    }

    let changes_made = !_.isEqual(plant, changedPlant) || imageData.length > plant?.images;
    let options = (
        <Grid className={classes.optionsContainer} container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<RestoreIcon />}
                    onClick={revertPlant}
                >Revert</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changedPlant?.id}
                    startIcon={<DeleteIcon />}
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
                        {changedPlant?.skus?.map((s, index) => (
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Latin Name"
                                value={changedPlant?.latinName}
                                onChange={e => setChangedPlant({ ...plant, latinName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Common Name"
                                value={getPlantTrait('commonName', changedPlant)}
                                onChange={e => updateTrait('commonName', e.target.value, false)}
                            />
                        </Grid>
                        {/* Select which trait you'd like to edit */}
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                fullWidth
                                id="setTraitField"
                                name="setTraitField"
                                options={Object.keys(PLANT_TRAITS)}
                                onChange={(e, v) => setSelectedTrait(PLANT_TRAITS[v])}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select plant trait"
                                        value={PLANT_TRAITS[selectedTrait] ?? ''}
                                    />
                                )}
                            />
                        </Grid>
                        {/* Edit selected trait */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Trait value"
                                value={getPlantTrait(selectedTrait, changedPlant) ?? ''}
                                onChange={e => updateTrait(selectedTrait, e.target.value, true)}
                            />
                        </Grid>
                        {/* ...or enter a custom value */}
                        <h3>Edit images</h3>
                        {/* Upload new images */}
                        <Grid item xs={12}>
                            <Dropzone
                                dropzoneText={'Drag \'n\' drop new images here or click'}
                                onUpload={uploadImages}
                                uploadText='Confirm'
                                cancelText='Cancel'
                            />
                        </Grid>
                        {/* And edit existing images */}
                        <Grid item xs={12}>
                            <ImageList data={imageData} onUpdate={applyChanges} />
                        </Grid>
                    </Grid>
                    <h3>Edit SKU info</h3>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Plant Code"
                                value={getPlantSkuField('sku', selectedSkuIndex, changedPlant) ?? ''}
                                onChange={e => updateSkuField('sku', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="SKU Size"
                                value={getPlantSkuField('size', selectedSkuIndex, changedPlant) ?? ''}
                                onChange={e => updateSkuField('size', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Price"
                                value={getPlantSkuField('price', selectedSkuIndex, changedPlant) ?? ''}
                                onChange={e => updateSkuField('price', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Availability"
                                value={getPlantSkuField('availability', selectedSkuIndex, changedPlant) ?? ''}
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