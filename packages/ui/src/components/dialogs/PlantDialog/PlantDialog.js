import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { 
    AppBar,
    Avatar,
    Button, 
    Dialog, 
    Divider,  
    Grid,
    IconButton,  
    List, 
    ListItem, 
    ListItemAvatar, 
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
    Collapsible,
    QuantityBox,
    Selector
} from 'components';
import {
    AddShoppingCart as AddShoppingCartIcon,
    Close as CloseIcon
} from '@material-ui/icons';
import { IMAGE_USE, SERVER_URL } from '@local/shared';
import _ from 'underscore';

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
    },
    left: {
        width: '50%',
        height: '80%',
        float: 'left',
    },
    right: {
        width: '50%',
        float: 'right',
    },
    displayImage: {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        bottom: '0%',
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
        latin_name: plant?.latinName,
        skus: plant?.skus ?? [],
    }
    const classes = useStyles();
    const [quantity, setQuantity] = useState(1);
    const [order_options, setOrderOptions] = useState([]);
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
        let curr_values = order_options.map(o => o.value);
        let new_values = options.map(o => o.value);
        if (_.isEqual(curr_values, new_values)) return;
        setOrderOptions(options);
        setSelected(order_options.length > 0 ? order_options[0].value : null);
    }, [plant, order_options])

    let display;
    let display_data = plant.images.find(image => image.usedFor === IMAGE_USE.PlantDisplay)?.image;
    if (!display_data && plant.images.length > 0) display_data = plant.images[0].image;
    if (display_data) {
        display = <img src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={plant.latin_name} />
    } else {
        display = <NoImageWithTextIcon className={classes.displayImage} />
    }

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

    let options = (
        <Grid className={classes.optionsContainer} container spacing={2}>
            <Grid item xs={6} sm={4}>
                <Selector
                    fullWidth
                    options={order_options}
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
                    disabled={selected===null}
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
                                {plant.latin_name}
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
                <div className={classes.left}>
                    {display}
                </div>
                <div className={classes.right}>
                    {plant.description ?
                        <Collapsible style={{ height: '20%' }} title="Description">
                            <p>{plant.description}</p>
                        </Collapsible>
                        : null}
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
                </div>
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