import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemIcon, ListItemText, Tooltip, Grid } from '@material-ui/core';
import { getImage } from "query/http_promises";
import { NoImageIcon, NoWaterIcon, RangeIcon, PHIcon, SoilTypeIcon, ColorWheelIcon, CalendarIcon, EvaporationIcon, BeeIcon, MapIcon, SaltIcon, SunIcon } from 'assets/img';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import ImageIcon from '@material-ui/icons/Image';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { displayPrice } from 'utils/displayPrice';
import Selector from 'components/inputs/Selector/Selector';
import CloseIcon from '@material-ui/icons/Close';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
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
    const [image, setImage] = useState(null);
    const [order_options, setOrderOptions] = useState([]);
    // Stores the id of the selected sku
    const [selected, setSelected] = useState(null);
    let selected_sku = plant.skus.find(s => s.id === selected);

    useEffect(() => {
        getImage(plant.display_id, 'l').then(response => {
            setImage(response.image);
        }).catch(error => {
            console.error(error);
        })
    }, [])

    useEffect(() => {
        let options = plant.skus?.map(s => {
            return {
                label: `#${s.size} : ${displayPrice(s.price)}`,
                value: s.id,
            }
        })
        setOrderOptions(options);
        setSelected(order_options.length > 0 ? order_options[0].value : null);
    }, [plant])

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
            field_string = plant[field].map((f) => f.value).join(', ')
        } else {
            field_string = plant[field].value;
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
        <Grid container spacing={2}>
            <Grid item xs={5}>
                <Selector
                    fullWidth
                    options={order_options}
                    selected={selected}
                    handleChange={(e) => setSelected(e.target.value)}
                    inputAriaLabel='size-selector-label'
                    label="Size" />
            </Grid>
            <Grid item xs={5}>
                <QuantityBox
                    min_value={0}
                    max_value={Math.max.apply(Math, plant.skus.map(s => s.availability))}
                    initial_value={1}
                    value={quantity}
                    valueFunc={setQuantity} />
            </Grid>
            <Grid item xs={2}>
                <Tooltip title="Add to cart">
                    <IconButton onClick={() => onCart(plant.latin_name ?? plant.common_name ?? 'plant', selected_sku, 'ADD', quantity)}>
                        <AddShoppingCartIcon />
                    </IconButton>
                </Tooltip>
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