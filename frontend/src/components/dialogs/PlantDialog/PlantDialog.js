import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
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
import PubSub from 'utils/pubsub';
import { PUBS } from '@local/shared';
import { useGet } from "restful-react";
import { 
    BeeIcon,
    CalendarIcon,
    ColorWheelIcon, 
    EvaporationIcon,
    MapIcon,
    NoImageIcon, 
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
import { displayPrice } from 'utils/displayPrice';
import {
    AddShoppingCart as AddShoppingCartIcon,
    Close as CloseIcon
} from '@material-ui/icons';
import Cookies from 'js-cookie';
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
        height: '80%',
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
    onCart,
    open = true,
    onClose,
}) {
    console.log('EXPANDED PLANT', plant)
    plant = {
        ...plant,
        latin_name: plant?.latin_name ?? 'Nothing selected',
        skus: plant?.skus ?? [],
    }
    const classes = useStyles();
    const [quantity, setQuantity] = useState(1);
    const [image, setImage] = useState(JSON.parse(Cookies.get(`nln-img-${plant.display_key}`)));
    const [order_options, setOrderOptions] = useState([]);
    // Stores the id of the selected sku
    const [selected, setSelected] = useState(null);
    let selected_sku = plant.skus.find(s => s.id === selected);

    useGet({
        path: "image",
        lazy: image !== null,
        queryParams: { key: plant.display_key, size: 'l' },
        resolve: (response) => {
            if (response.ok) {
                let image_data = {
                    src: `data:image/jpeg;base64,${response.image}`,
                    alt: response.alt
                }
                setImage(image_data);
                Cookies.set(`nln-img-${plant.display_key}`, JSON.stringify(image_data));
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

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

    let display_image;
    if (image) {
        display_image = <img src={`data:image/jpeg;base64,${image}`} className={classes.displayImage} alt="TODO" />
    } else {
        display_image = <NoImageIcon className={classes.displayImage} />
    }

    const traitIconList = (field, Icon, title, alt) => {
        if (!plant || !plant[field]) return null;
        if (!alt) alt = title;
        let field_string;
        if (Array.isArray(plant[field])) {
            field_string = plant[field].map(f => f).join(', ')
        } else {
            field_string = plant[field];
        }
        return (
            <div>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar className={classes.avatar}>
                            <Icon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={title} secondary={field_string} />
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
                    color="secondary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => onCart(plant.latin_name ?? plant.common_name ?? 'plant', selected_sku, 'ADD', quantity)}
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
                                {plant.common_name}
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
                    {display_image}
                </div>
                <div className={classes.right}>
                    {plant.description ?
                        <Collapsible style={{ height: '20%' }} title="Description">
                            <p>{plant.description}</p>
                        </Collapsible>
                        : null}
                    <List>
                        {traitIconList("zones", MapIcon, "Zones")}
                        {traitIconList("physiographic_regions", MapIcon, "Physiographic Region")}
                        {traitIconList("attracts_pollinators_and_wildlifes", BeeIcon, "Attracted Pollinators and Wildlife")}
                        {traitIconList("drought_tolerance", NoWaterIcon, "Drought Tolerance")}
                        {traitIconList("salt_tolerance", SaltIcon, "Salt Tolerance")}
                        <Divider />
                        {traitIconList("bloom_colors", ColorWheelIcon, "Bloom Colors")}
                        {traitIconList("bloom_times", CalendarIcon, "Bloom Times")}
                        <Divider />
                        {traitIconList("light_ranges", RangeIcon, "Light Range")}
                        {traitIconList("optimal_light", SunIcon, "Optimal Light")}
                        <Divider />
                        {traitIconList("soil_moistures", EvaporationIcon, "Soil Moisture")}
                        {traitIconList("soil_phs", PHIcon, "Soil PH")}
                        {traitIconList("soil_types", SoilTypeIcon, "Soil Type")}
                    </List>
                </div>
                {options}
            </div>
        </Dialog>
    );
}

PlantDialog.propTypes = {
    plant: PropTypes.object,
    onCart: PropTypes.func.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export default PlantDialog;