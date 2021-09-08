import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import {
    AppBar,
    Avatar,
    Button,
    Collapse,
    Dialog,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Slide,
    Toolbar,
    Typography
} from '@material-ui/core';
import { showPrice, getImageSrc, getPlantTrait } from 'utils';
import {
    BeeIcon,
    CalendarIcon,
    ColorWheelIcon,
    EvaporationIcon,
    MapIcon,
    NoImageWithTextIcon,
    NoWaterIcon,
    PHIcon,
    RangeIcon,
    SaltIcon,
    SoilTypeIcon,
    SunIcon
} from 'assets/img';
import {
    QuantityBox,
    Selector
} from 'components';
import {
    AddShoppingCart as AddShoppingCartIcon,
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
} from '@material-ui/icons';
import { IMAGE_SIZE, SERVER_URL } from '@local/shared';
import _ from 'lodash';
import Carousel from 'react-gallery-carousel';
import 'react-gallery-carousel/dist/index.css';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    vertical: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center"
    },
    title: {
        textAlign: 'center',
    },
    container: {
        background: theme.palette.background.default,
        flex: 'auto',
        paddingBottom: '15vh',
    },
    displayImage: {
        maxHeight: '75vh',
    },
    avatar: {
        background: 'transparent',
    },
    optionsContainer: {
        padding: theme.spacing(2),
    },
    bottom: {
        background: theme.palette.primary.main,
        position: 'fixed',
        bottom: '0',
        width: '-webkit-fill-available',
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function PlantDialog({
    plant,
    selectedSku,
    onSessionUpdate,
    onAddToCart,
    open = true,
    onClose,
}) {
    plant = {
        ...plant,
        latinName: plant?.latinName,
        skus: plant?.skus ?? [],
    }
    const classes = useStyles();
    const theme = useTheme();
    const [quantity, setQuantity] = useState(1);
    const [orderOptions, setOrderOptions] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    // Stores the id of the selected sku
    const [currSku, setCurrSku] = useState(selectedSku);

    useEffect(() => {
        setCurrSku(selectedSku);
    }, [selectedSku])

    useEffect(() => {
        let options = plant.skus?.map(s => {
            return {
                label: `#${s.size} : ${showPrice(s.price)}`,
                value: s,
            }
        })
        // If options is unchanged, do not set
        let curr_values = orderOptions.map(o => o.value);
        let new_values = options.map(o => o.value);
        if (_.isEqual(curr_values, new_values)) return;
        setOrderOptions(options);
    }, [plant, orderOptions])

    const images = Array.isArray(plant.images) ? plant.images.map(d => ({
        alt: d.image.alt,
        src: `${SERVER_URL}/${getImageSrc(d.image)}`,
        thumbnail: `${SERVER_URL}/${getImageSrc(d.image, IMAGE_SIZE.M)}`
    })) : [];

    const traitIconList = (traitName, Icon, title, alt) => {
        if (!alt) alt = title;
        const traitValue = getPlantTrait(traitName, plant);
        if (!traitValue) return null;
        return (
            <div>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar className={classes.avatar}>
                            <Icon alt={alt} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={title} secondary={traitValue} />
                </ListItem>
            </div>
        )
    }

    const handleDetailsClick = () => {
        setDetailsOpen(!detailsOpen);
    };

    let options = (
        <Grid className={classes.optionsContainer} container spacing={2}>
            <Grid item xs={6} sm={4}>
                <Selector
                    fullWidth
                    options={orderOptions}
                    selected={currSku}
                    handleChange={(e) => setCurrSku(e.target.value)}
                    inputAriaLabel='size-selector-label'
                    label="Size"
                    color={theme.palette.primary.contrastText}
                />
            </Grid>
            <Grid item xs={6} sm={4}>
                <QuantityBox
                    style={{height: '100%'}}
                    min_value={0}
                    max_value={Math.max.apply(Math, plant.skus.map(s => s.availability))}
                    initial_value={1}
                    value={quantity}
                    valueFunc={setQuantity} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    disabled={!currSku}
                    fullWidth
                    style={{height: '100%'}}
                    color="secondary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => onAddToCart(getPlantTrait('commonName', plant) ?? plant.latinName, currSku, quantity)}
                >Order</Button>
            </Grid>
        </Grid>
    );

    const displayedTraitData = [
        ['zones', MapIcon, 'Zones'],
        ['physiographicRegions', MapIcon, 'Physiographic Region'],
        ['attractsPollinatorsAndWildlifes', BeeIcon, 'Attracted Pollinators and Wildlife'],
        ['droughtTolerance', NoWaterIcon, 'Drought Tolerance'],
        ['saltTolerance', SaltIcon, 'Salt Tolerance'],
        ['bloomColors', ColorWheelIcon, 'Bloom Colors'],
        ['bloomTimes', CalendarIcon, 'Bloom Times'],
        ['lightRanges', RangeIcon, 'Light Range'],
        ['optimalLight', SunIcon, 'Optimal Light'],
        ['soilMoistures', EvaporationIcon, 'Soil Moisture'],
        ['soilPhs', PHIcon, 'Soil PH'],
        ['soilTypes', SoilTypeIcon, 'Soil Type']
    ].map(d => traitIconList(...d)).filter(d => d !== null);

    return (
        <Dialog aria-describedby="modal-title" fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Grid container spacing={0}>
                        <Grid className={classes.title} item xs={12}>
                            <Typography id="modal-title" variant="h5">
                                {plant.latinName}
                            </Typography>
                            <Typography variant="h6">
                                {getPlantTrait('commonName', plant)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <div className={classes.container}>
                <Grid container spacing={0}>
                    <Grid item lg={6} xs={12}>
                        {
                            images.length > 0 ?
                                <Carousel className={classes.displayImage} canAutoPlay={false} images={images} /> :
                                <NoImageWithTextIcon className={classes.displayImage} />
                        }
                    </Grid>
                    <Grid item lg={6} xs={12}>
                        {plant.description ?
                            <Collapse style={{ height: '20%' }} title="Description">
                                <p>{plant.description}</p>
                            </Collapse>
                            : null}
                        {displayedTraitData.length > 0 ? (
                            <React.Fragment>
                                <ListItem className={classes.menuItem} button onClick={handleDetailsClick}>
                                    <ListItemIcon><InfoIcon /></ListItemIcon>
                                    <ListItemText primary="Details" />
                                    {detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItem>
                                <Collapse in={detailsOpen} timeout='auto' unmountOnExit>
                                    <List>{displayedTraitData}</List>
                                </Collapse>
                            </React.Fragment>
                        ) : null}
                    </Grid>
                </Grid>
                <div className={classes.bottom}>
                    {options}
                </div>
            </div>
        </Dialog>
    );
}

PlantDialog.propTypes = {
    plant: PropTypes.object,
    selectedSku: PropTypes.object,
    onSessionUpdate: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { PlantDialog };