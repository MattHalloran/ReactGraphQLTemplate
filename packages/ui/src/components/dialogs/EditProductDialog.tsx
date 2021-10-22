import { useState, useEffect, useCallback } from 'react';
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
    TextField,
    Theme,
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
import { addImagesMutation, deleteProductsMutation, updateProductMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { Dropzone, ImageList } from 'components';
import {
    addToArray,
    deleteArrayIndex,
    getProductTrait,
    makeID,
    PUBS,
    setProductSkuField,
    setProductTrait
} from 'utils';
import PubSub from 'pubsub-js';
import isEqual from 'lodash/isEqual';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { UpTransition } from 'components';
import { updateProduct } from 'graphql/generated/updateProduct';
import { deleteProducts } from 'graphql/generated/deleteProducts';
import { addImages } from 'graphql/generated/addImages';
import { Product, Sku } from 'types';

// Common product traits, and their corresponding field names
const PRODUCT_TRAITS = {
    'Has Warp Drive?': 'hasWarpDrive',
    'Note': 'note',
    'Top Speed': 'topSpeed',
}

const useStyles = makeStyles((theme: Theme) => ({
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

interface Props {
    product: Product;
    selectedSku: Sku;
    open?: boolean;
    onClose: () => any;
}

export const EditProductDialog = ({
    product,
    selectedSku,
    open = true,
    onClose,
}: Props) => {
    const classes = useStyles();
    const [changedProduct, setChangedProduct] = useState<Product>(product);
    const [updateProduct] = useMutation<updateProduct>(updateProductMutation);
    const [deleteProduct] = useMutation<deleteProducts>(deleteProductsMutation);

    const [imageData, setImageData] = useState<any[]>([]);
    const [imagesChanged, setImagesChanged] = useState(false);
    const [addImages] = useMutation<addImages>(addImagesMutation);

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
    const [selectedTrait, setSelectedTrait] = useState(PRODUCT_TRAITS[0]);

    useEffect(() => {
        setCurrSkuIndex((selectedSku && product?.skus) ? product.skus.findIndex(s => s.sku === selectedSku.sku) : 0)
    }, [product, selectedSku])

    const findImageData = useCallback(() => {
        setImagesChanged(false);
        if (Array.isArray(product?.images)) {
            setImageData(product.images.map((d, index) => ({
                ...d.image,
                pos: index
            })));
        } else {
            setImageData([]);
        }
    }, [product])

    useEffect(() => {
        setChangedProduct({ ...product });
        findImageData();
    }, [findImageData, product, setImagesChanged])

    function revertProduct() {
        setChangedProduct(product);
        findImageData();
    }

    const confirmDelete = useCallback(() => {
        PubSub.publish(PUBS.AlertDialog, {
            message: `Are you sure you want to delete this product, along with its SKUs? This cannot be undone.`,
            firstButtonText: 'Yes',
            firstButtonClicked: () => mutationWrapper({
                mutation: deleteProduct,
                data: { variables: { ids: [changedProduct.id] } },
                successMessage: () => 'Product deleted.',
                onSuccess: () => onClose(),
                errorMessage: () => 'Failed to delete product.',
            }),
            secondButtonText: 'No',
        });
    }, [changedProduct, deleteProduct, onClose])

    const saveProduct = useCallback(async () => {
        let product_data = {
            id: changedProduct.id,
            name: changedProduct.name,
            traits: changedProduct.traits.map(t => {
                return { name: t.name, value: t.value }
            }),
            skus: changedProduct.skus.map(s => {
                return { sku: s.sku, isDiscountable: s.isDiscountable, size: s.size, note: s.note, availability: parseInt(s.availability) || 0, price: s.price, status: s.status }
            }),
            images: imageData.map(d => {
                return { hash: d.hash, isDisplay: d.isDisplay ?? false }
            })
        }
        mutationWrapper({
            mutation: updateProduct,
            data: { variables: { input: product_data } },
            successMessage: () => 'Product updated.',
            onSuccess: () => setImagesChanged(false),
            errorMessage: () => 'Failed to delete product.'
        })
    }, [changedProduct, imageData, updateProduct, setImagesChanged])

    const updateTrait = useCallback((traitName, value, createIfNotExists) => {
        const updatedProduct = setProductTrait(traitName, value, changedProduct, createIfNotExists);
        if (updatedProduct) setChangedProduct(updatedProduct);
    }, [changedProduct])

    const getSkuField = useCallback((fieldName) => {
        if (!Array.isArray(changedProduct?.skus) || currSkuIndex < 0 || currSkuIndex >= changedProduct.skus.length) return '';
        return changedProduct.skus[currSkuIndex][fieldName];
    }, [changedProduct, currSkuIndex])

    const updateSkuField = useCallback((fieldName, value) => {
        const updatedProduct = setProductSkuField(fieldName, currSkuIndex, value, changedProduct);
        if (updatedProduct) setChangedProduct(updatedProduct)
    }, [changedProduct, currSkuIndex])

    function newSku() {
        setChangedProduct(p => ({
            ...p,
            skus: addToArray(p.skus, { sku: makeID(10) }),
        }));
    }

    function removeSku() {
        if (currSkuIndex < 0) return;
        setChangedProduct(p => ({
            ...p,
            skus: deleteArrayIndex(p.skus, currSkuIndex),
        }));
    }

    const updateTraitField = useCallback((_, value: any) => setSelectedTrait(PRODUCT_TRAITS[value]), []);

    const imageListUpdate = useCallback((d) => { setImageData(d); setImagesChanged(true) }, []);
    
    const updateSkuSku = useCallback((e) => updateSkuField('sku', e.target.value), [updateSkuField]);
    const updateSkuSize = useCallback((e) => updateSkuField('size', e.target.value), [updateSkuField]);
    const updateSkuPrice = useCallback((e) => updateSkuField('price', e.target.value), [updateSkuField]);
    const updateSkuAvailability = useCallback((e) => updateSkuField('availability', e.target.value), [updateSkuField]);

    let changes_made = !isEqual(product, changedProduct) || imagesChanged;
    let options = (
        <Grid className={classes.optionsContainer} container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<RestoreIcon />}
                    onClick={revertProduct}
                >Revert</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changedProduct?.id}
                    startIcon={<DeleteIcon />}
                    onClick={confirmDelete}
                >Delete</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    disabled={!changes_made}
                    startIcon={<UpdateIcon />}
                    onClick={saveProduct}
                >Update</Button>
            </Grid>
        </Grid>
    );

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={UpTransition}>
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
                        {changedProduct?.skus?.map((s, i) => (
                            <ListItem
                                key={s.sku}
                                button
                                className={`sku-option ${i === currSkuIndex ? classes.selected : ''}`}
                                onClick={() => setCurrSkuIndex(i)}>
                                <ListItemText primary={s.sku} />
                            </ListItem>
                        ))}
                    </List>
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
                <div className={classes.content}>
                    <Typography className={classes.title} variant="h5" component="h3">Edit product info</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Name"
                                value={changedProduct?.name}
                                onChange={e => setChangedProduct({ ...product, name: e.target.value })}
                            />
                        </Grid>
                        {/* Select which trait you'd like to edit */}
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                fullWidth
                                freeSolo
                                id="setTraitField"
                                options={Object.keys(PRODUCT_TRAITS)}
                                onChange={updateTraitField}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select product trait"
                                        value={PRODUCT_TRAITS[selectedTrait] ?? ''}
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
                                value={getProductTrait(selectedTrait, changedProduct) ?? ''}
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
                            <ImageList data={imageData} onUpdate={imageListUpdate} />
                        </Grid>
                    </Grid>
                    <Typography className={classes.title} variant="h5" component="h3">Edit SKU info</Typography>
                    <Grid className={classes.gridContainer} container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Product Code"
                                value={getSkuField('sku')}
                                onChange={updateSkuSku}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="SKU Size"
                                value={getSkuField('size')}
                                onChange={updateSkuSize}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Price"
                                value={getSkuField('price')}
                                onChange={updateSkuPrice}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Availability"
                                value={getSkuField('availability')}
                                onChange={updateSkuAvailability}
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