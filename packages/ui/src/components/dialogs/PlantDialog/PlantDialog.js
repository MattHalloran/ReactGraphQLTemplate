import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
    AppBar,
    Avatar,
    Button,
    Collapse,
    Dialog,
    Divider,
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
import { displayPrice, getImageSrc, getPlantTrait } from 'utils';
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
import _ from 'underscore';
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
        padding: theme.spacing(1),
        background: theme.palette.background.default,
        minHeight: '-webkit-fill-available',
    },
    displayImage: {
        maxHeight: '50vh',
    },
    avatar: {
        background: 'transparent',
    },
    optionsContainer: {
        marginBottom: theme.spacing(1),
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function PlantDialog({
    plant,
    onSessionUpdate,
    onAddToCart,
    open = true,
    onClose,
}) {
    console.log('EXPANDED PLANT', plant)
    plant = {
        ...plant,
        latinName: plant?.latinName,
        skus: plant?.skus ?? [],
    }
    const classes = useStyles();
    const [quantity, setQuantity] = useState(1);
    const [orderOptions, setOrderOptions] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    // Stores the id of the selected sku
    const [selected, setSelected] = useState(null);
    let selected_sku = plant.skus.find(s => s.id === selected);

    useEffect(() => {
        let options = plant.skus?.map(s => {
            return {
                label: `#${s.size} : ${displayPrice(s.price)}`,
                value: s.id,
            }
        })
        // If options is unchanged, do not set
        let curr_values = orderOptions.map(o => o.value);
        let new_values = options.map(o => o.value);
        if (_.isEqual(curr_values, new_values)) return;
        setOrderOptions(options);
        setSelected(options.length > 0 ? options[0].value : null);
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
                    selected={selected}
                    handleChange={(e) => setSelected(e.target.value)}
                    inputAriaLabel='size-selector-label'
                    label="Size" />
            </Grid>
            <Grid item xs={6} sm={4}>
                <QuantityBox
                    min_value={0}
                    max_value={Math.max.apply(Math, plant.skus.map(s => s.availability))}
                    initial_value={1}
                    value={quantity}
                    valueFunc={setQuantity} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button
                    disabled={selected === null}
                    fullWidth
                    style={{}}
                    color="secondary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => onAddToCart(plant.latinName ?? getPlantTrait('commonName', plant) ?? 'plant', selected_sku, quantity)}
                >Order</Button>
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
                    <Grid container spacing={0}>
                        <Grid className={classes.title} item xs={12}>
                            <Typography variant="h6">
                                {plant.latinName}
                            </Typography>
                            <Typography variant="h6">
                                {getPlantTrait('commonName', plant)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            {options}
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
                        <ListItem className={classes.menuItem} button onClick={handleDetailsClick}>
                            <ListItemIcon><InfoIcon /></ListItemIcon>
                            <ListItemText primary="Details" />
                            {detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItem>
                        <Collapse in={detailsOpen} timeout="auto" unmountOnExit>
                            <List>
                                {traitIconList("zones", MapIcon, "Zones")}
                                {traitIconList("physiographicRegions", MapIcon, "Physiographic Region")}
                                {traitIconList("attractsPollinatorsAndWildlifes", BeeIcon, "Attracted Pollinators and Wildlife")}
                                {traitIconList("droughtTolerance", NoWaterIcon, "Drought Tolerance")}
                                {traitIconList("saltTolerance", SaltIcon, "Salt Tolerance")}
                                <Divider />
                                {traitIconList("bloomColors", ColorWheelIcon, "Bloom Colors")}
                                {traitIconList("bloomTimes", CalendarIcon, "Bloom Times")}
                                <Divider />
                                {traitIconList("lightRanges", RangeIcon, "Light Range")}
                                {traitIconList("optimalLight", SunIcon, "Optimal Light")}
                                <Divider />
                                {traitIconList("soilMoistures", EvaporationIcon, "Soil Moisture")}
                                {traitIconList("soilPhs", PHIcon, "Soil PH")}
                                {traitIconList("soilTypes", SoilTypeIcon, "Soil Type")}
                            </List>
                        </Collapse>
                    </Grid>
                </Grid>
                {options}
            </div>
        </Dialog>
    );
}

PlantDialog.propTypes = {
    plant: PropTypes.object,
    onSessionUpdate: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { PlantDialog };