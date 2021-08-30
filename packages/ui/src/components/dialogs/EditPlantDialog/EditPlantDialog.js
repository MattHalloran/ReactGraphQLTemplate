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
    Tooltip,
    Typography
} from '@material-ui/core';
import {
    AddBox as AddBoxIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Restore as RestoreIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { addImagesMutation, deletePlantsMutation, updatePlantMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { Dropzone, ImageList } from 'components';
import {
    addToArray,
    deleteArrayIndex,
    getPlantTrait,
    makeID,
    PUBS,
    PubSub,
    setPlantSkuField,
    setPlantTrait
} from 'utils';
// import { DropzoneAreaBase } from 'material-ui-dropzone';
import _ from 'underscore';
import { mutationWrapper } from 'graphql/wrappers';

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
        background: theme.palette.background.default,
    },
    sideNav: {
        width: '25%',
        height: '100%',
        float: 'left',
        borderRight: `2px solid ${theme.palette.text.primary}`,
    },
    title: {
        paddingBottom: '1vh',
    },
    gridContainer: {
        paddingBottom: '3vh',
    },
    optionsContainer: {
        padding: theme.spacing(2),
        background: theme.palette.primary.main,
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
        padding: theme.spacing(1)
    },
    imageRow: {
        minHeight: '100px',
    },
    selected: {
        background: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
    skuHeader: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function EditPlantDialog({
    plant,
    selectedSku,
    trait_options,
    open = true,
    onClose,
}) {
    const classes = useStyles();
    const [changedPlant, setChangedPlant] = useState(plant);
    console.log('PLANT POPUP', changedPlant);
    const [updatePlant] = useMutation(updatePlantMutation);
    const [deletePlant] = useMutation(deletePlantsMutation);

    const [imageData, setImageData] = useState([]);
    const [imagesChanged, setImagesChanged] = useState(false);
    const [addImages] = useMutation(addImagesMutation);

    const uploadImages = (acceptedFiles) => {
        mutationWrapper({
            mutation: addImages,
            data: { variables: { files: acceptedFiles, } },
            successMessage: () => `Successfully uploaded ${acceptedFiles.length} image(s)`,
            onSuccess: (response) => {
                setImageData([...imageData, ...response.data.addImages.filter(d => d.success).map(d => {
                    return {
                        hash: d.hash,
                        files: [{ src: d.src }]
                    }
                })])
                setImagesChanged(true);
            }
        })
    }

    const [currSku, setCurrSku] = useState(selectedSku);
    const currSkuIndex = (currSku && plant?.skus) ? plant.skus.findIndex(s => s.sku === currSku.sku) : 0;
    const [selectedTrait, setSelectedTrait] = useState(PLANT_TRAITS[0]);

    useEffect(() => {
        setCurrSku(selectedSku);
    }, [selectedSku])

    const findImageData = useCallback(() => {
        setImagesChanged(false);
        if (Array.isArray(plant?.images)) {
            setImageData(plant.images.map((d, index) => ({
                ...d.image,
                pos: index
            })));
        } else {
            setImageData(null);
        }
    }, [plant])

    useEffect(() => {
        setChangedPlant({ ...plant });
        findImageData();
    }, [findImageData, plant, setImagesChanged])

    function revertPlant() {
        setChangedPlant(plant);
        findImageData();
    }

    const confirmDelete = useCallback(() => {
        PubSub.publish(PUBS.AlertDialog, {
            message: `Are you sure you want to delete this plant, along with its SKUs? This cannot be undone.`,
            firstButtonText: 'Yes',
            firstButtonClicked: () => mutationWrapper({
                mutation: deletePlant,
                data: { variables: { ids: [changedPlant.id] } },
                successMessage: () => 'Plant deleted.',
                onSuccess: () => onClose(),
                errorMesage: () => 'Failed to delete plant.',
            }),
            secondButtonText: 'No',
        });
    }, [changedPlant, deletePlant, onClose])

    const savePlant = useCallback(async () => {
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
                return { hash: d.hash, isDisplay: d.isDisplay ?? false }
            })
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        mutationWrapper({
            mutation: updatePlant,
            data: { variables: { input: plant_data } },
            successMessage: () => 'Plant updated.',
            onSuccess: () => setImagesChanged(false),
            errorMessage: () => 'Failed to delete plant.'
        })
    }, [changedPlant, imageData, updatePlant, setImagesChanged])

    const updateTrait = useCallback((traitName, value, createIfNotExists) => {
        const updatedPlant = setPlantTrait(traitName, value, changedPlant, createIfNotExists);
        console.log('UPDATE TRAITTTT', traitName, value, updatedPlant)
        if (updatedPlant) setChangedPlant(updatedPlant);
    }, [changedPlant])

    const updateSkuField = useCallback((fieldName, value) => {
        const updatedPlant = setPlantSkuField(fieldName, currSkuIndex, value, changedPlant);
        if (updatedPlant) setChangedPlant(updatedPlant)
    }, [changedPlant, currSkuIndex])

    function newSku() {
        setChangedPlant(p => ({
            ...p,
            skus: addToArray(p.skus, { sku: makeID(10) }),
        }));
    }

    function removeSku() {
        if (!currSku) return;
        setChangedPlant(p => ({
            ...p,
            skus: deleteArrayIndex(p.skus, currSkuIndex),
        }));
    }

    let changes_made = !_.isEqual(plant, changedPlant) || imagesChanged;
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
                        style={{paddingTop: '0'}}
                        aria-label="sku select"
                        aria-labelledby="sku-select-subheader">
                        <ListSubheader className={classes.skuHeader} component="div" id="sku-select-subheader">
                            <Typography className={classes.title} variant="h5" component="h3">SKUs</Typography>
                        </ListSubheader>
                        {changedPlant?.skus?.map((s) => (
                            <ListItem
                                key={s.sku}
                                button
                                className={`sku-option ${s.sku === currSku?.sku ? classes.selected : ''}`}
                                onClick={() => setCurrSku(s)}>
                                <ListItemText primary={s.sku} />
                            </ListItem>
                        ))}
                    </List>
                    <div>
                        {currSku ?
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
                    <Typography className={classes.title} variant="h5" component="h3">Edit plant info</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
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
                    </Grid>
                    <Typography className={classes.title} variant="h5" component="h3">Edit images</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
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
                            <ImageList data={imageData} onUpdate={(d) => {setImageData(d); setImagesChanged(true)}} />
                        </Grid>
                    </Grid>
                    <Typography className={classes.title} variant="h5" component="h3">Edit SKU info</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Plant Code"
                                value={currSku?.sku ?? ''}
                                onChange={e => updateSkuField('sku', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="SKU Size"
                                value={currSku?.size ?? ''}
                                onChange={e => updateSkuField('size', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Price"
                                value={currSku?.price ?? ''}
                                onChange={e => updateSkuField('price', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Availability"
                                value={currSku?.availability ?? ''}
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
    selectedSku: PropTypes.object,
    trait_options: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { EditPlantDialog };