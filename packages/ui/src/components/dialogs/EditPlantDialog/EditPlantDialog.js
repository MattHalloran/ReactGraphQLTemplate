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
import _ from 'lodash';
import { mutationWrapper } from 'graphql/utils/wrappers';

// Common plant traits, and their corresponding field names
const PLANT_TRAITS = {
    'Attracts Pollinators & Wildlife': 'attractsPollinatorsAndWildlife',
    'Bloom Colors': 'bloomColors',
    'Bloom Times': 'bloomTimes',
    'Drought Tolerance': 'droughtTolerance',
    'Grown Height': 'grownHeight',
    'Grown Spread': 'grownSpread',
    'Growth Rate': 'growthRate',
    'Hardiness Zones': 'zone',
    'Light Ranges': 'lightRanges',
    'Optimal Light': 'optimalLight',
    'Salt Tolerance': 'saltTolerance',
    'Soil Moistures': 'soilMoistures',
    'Soil PHs': 'soilPhs',
    'Soil Types': 'soilTypes',
}

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    container: {
        background: theme.palette.background.default,
        flex: 'auto',
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
        padding: theme.spacing(1),
        paddingBottom: '20vh',
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
    },
    bottom: {
        position: 'fixed',
        bottom: '0',
        width: '-webkit-fill-available',
        zIndex: 1,
    },
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

    const [currSkuIndex, setCurrSkuIndex] = useState(-1);
    const [selectedTrait, setSelectedTrait] = useState(PLANT_TRAITS[0]);

    useEffect(() => {
        setCurrSkuIndex((selectedSku && plant?.skus) ? plant.skus.findIndex(s => s.sku === selectedSku.sku) : 0)
    }, [plant, selectedSku])

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
        if (updatedPlant) setChangedPlant(updatedPlant);
    }, [changedPlant])

    const getSkuField = useCallback((fieldName) => {
        if (!Array.isArray(changedPlant?.skus) || currSkuIndex < 0 || currSkuIndex >= changedPlant.skus.length) return '';
        return changedPlant.skus[currSkuIndex][fieldName];
    }, [changedPlant, currSkuIndex])

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
        if (currSkuIndex < 0) return;
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
                </Toolbar>
            </AppBar>
            <div className={classes.container}>
                <div className={classes.sideNav}>
                    <List
                        style={{ paddingTop: '0' }}
                        aria-label="sku select"
                        aria-labelledby="sku-select-subheader">
                        <ListSubheader className={classes.skuHeader} component="div" id="sku-select-subheader">
                            <Typography className={classes.title} variant="h5" component="h3">SKUs</Typography>
                        </ListSubheader>
                        {changedPlant?.skus?.map((s, i) => (
                            <ListItem
                                key={s.sku}
                                button
                                className={`sku-option ${i === currSkuIndex ? classes.selected : ''}`}
                                onClick={() => setCurrSkuIndex(i)}>
                                <ListItemText primary={s.sku} />
                            </ListItem>
                        ))}
                    </List>
                    <div>
                        {currSkuIndex >= 0 ?
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
                                freeSolo
                                id="setTraitField"
                                name="setTraitField"
                                options={Object.keys(PLANT_TRAITS)}
                                onChange={(_, value) => setSelectedTrait(PLANT_TRAITS[value])}
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
                            <ImageList data={imageData} onUpdate={(d) => { setImageData(d); setImagesChanged(true) }} />
                        </Grid>
                    </Grid>
                    <Typography className={classes.title} variant="h5" component="h3">Edit SKU info</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Plant Code"
                                value={getSkuField('sku')}
                                onChange={e => updateSkuField('sku', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="SKU Size"
                                value={getSkuField('size')}
                                onChange={e => updateSkuField('size', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Price"
                                value={getSkuField('price')}
                                onChange={e => updateSkuField('price', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Availability"
                                value={getSkuField('availability')}
                                onChange={e => updateSkuField('availability', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </div>
                <div className={classes.bottom}>
                    {options}
                </div>
            </div>
        </Dialog>
    );
}

EditPlantDialog.propTypes = {
    sku: PropTypes.object.isRequired,
    selectedSku: PropTypes.object,
    trait_options: PropTypes.array,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { EditPlantDialog };