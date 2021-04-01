import { useState, useLayoutEffect, useEffect, useCallback, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { getImages, getImage, getInventory, getInventoryPage, updateCart } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { LINKS, PUBS, SORT_OPTIONS } from "utils/consts";
import Modal from "components/wrappers/StyledModal/StyledModal";
import { NoImageIcon, NoWaterIcon, RangeIcon, PHIcon, SoilTypeIcon, ColorWheelIcon, CalendarIcon, EvaporationIcon, BeeIcon, MapIcon, SaltIcon, SunIcon } from 'assets/img';
import { getSession, getCart } from "utils/storage";
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { displayPrice } from 'utils/displayPrice';
import Selector from 'components/Selector/Selector';
import PlantCard from 'components/PlantCard/PlantCard';
import { Tooltip, Typography, Grid, IconButton } from '@material-ui/core';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
}));

function ShoppingList({
    page_size,
    sort = SORT_OPTIONS[0].value,
    filters,
    hideOutOfStock,
    searchString = '',
}) {
    page_size = page_size ?? Math.ceil(window.innerHeight / 150) * Math.ceil(window.innerWidth / 150);
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [cart, setCart] = useState(getCart());
    const [popup, setPopup] = useState(null);
    // Plant data for every loaded plant
    const [loaded_plants, setLoadedPlants] = useState([]);
    const all_plant_ids = useRef([]);
    // Plant data for all visible plants (i.e. not filtered)
    const [plants, setPlants] = useState([]);
    // Thumbnail data for every plant
    const [thumbnails, setThumbnails] = useState([]);
    // Full image data for every sku group
    const [full_images, setFullImages] = useState([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    // Find the current SKU group index, by any of the group's SKUs
    let curr_index = plants?.findIndex(c => c.skus.findIndex(s => s.sku === urlParams.sku) >= 0) ?? -1
    const loading = useRef(false);

    useEffect(() => {
        let ids = plants?.map(p => p.display_id);
        if (!ids) return;
        getImages(ids, 'm').then(response => {
            setThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });
    }, [plants])

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    useEffect(() => {
        PubSub.publish(PUBS.PopupOpen, curr_index >= 0);
    }, [curr_index])

    useEffect(() => {
        console.log('GRABBING ALL SKUS', sort)
        console.log(typeof sort);
        if (!session) return;
        let mounted = true;
        getInventory(sort, page_size, false)
            .then((response) => {
                if (!mounted) return;
                setLoadedPlants(response.page_results);
                all_plant_ids.current = response.plant_ids;
                console.log('ALL PLANT IDS IS', all_plant_ids.current)
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    // Determine which skus will be visible to the user (i.e. not filtered out)
    useEffect(() => {
        //First, determine if plants without availability shall be shown
        let visible_plants = loaded_plants;
        if (hideOutOfStock) {
            visible_plants = loaded_plants?.filter(plant => {
                if (plant.skus.length === 0) return true;
                return plant.skus.filter(sku => sku.status === 1 && sku.availability > 0).length > 0;
            })
        }
        //Now, filter out everything that doesn't match the search string
        if (searchString.length > 0) {
            let search = searchString.trim().toLowerCase();
            visible_plants = visible_plants?.filter(plant => plant.latin_name?.toLowerCase().includes(search) || plant.common_name?.toLowerCase().includes(search));
        }
        //Find all applied filters
        let applied_filters = [];
        for (const key in filters) {
            let filter_group = filters[key];
            for (let i = 0; i < filter_group.length; i++) {
                if (filter_group[i].checked) {
                    applied_filters.push([key, filter_group[i].label]);
                }
            }
        }
        //If no filters are set, show all plants
        if (applied_filters.length == 0) {
            setPlants(visible_plants);
            return;
        }
        //Select all plants that contain the filters
        let filtered_plants = [];
        for (let i = 0; i < visible_plants?.length ?? 0; i++) {
            let curr_plant = visible_plants[i];
            filterloop:
            for (let j = 0; j < applied_filters.length; j++) {
                let trait = applied_filters[j][0];
                let value = applied_filters[j][1];

                // Grab data depending on if the field is for the sku or its associated plant
                let data;
                if (trait === 'sizes') {
                    data = curr_plant.skus.map(s => s[trait]);
                } else {
                    data = curr_plant[trait];
                }

                if (Array.isArray(data) && data.length > 0) {
                    if (data.some(o => o.value === value)) {
                        filtered_plants.push(curr_plant);
                        break filterloop;
                    }
                } else if (data?.value === value) {
                    filtered_plants.push(curr_plant);
                    break filterloop;
                }
            }
        }
        setPlants(filtered_plants);
    }, [loaded_plants, filters, searchString, hideOutOfStock])

    const loadNextPage = useCallback(() => {
        if (loading.current || loaded_plants.length >= all_plant_ids.current.length) return;
        loading.current = true;
        //Grab all card thumbnail images
        let load_to = Math.min(all_plant_ids.current.length, loaded_plants.length + page_size - 1);
        let clone = all_plant_ids.current.slice();
        let page_ids = clone.splice(loaded_plants.length, load_to);
        if (page_ids.length == 0) {
            loading.current = false;
            return;
        }
        getInventoryPage(page_ids).then(response => {
            setLoadedPlants(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load SKUs!", error);
        }).finally(() => {
            loading.current = false;
        })
        return () => loading.current = false;
    }, [loaded_plants, all_plant_ids, page_size]);

    //Load next page if scrolling near the bottom of the page
    const checkScroll = useCallback(() => {
        const divElement = document.getElementById(track_scrolling_id);
        if (divElement.getBoundingClientRect().bottom <= 1.5 * window.innerHeight) {
            loadNextPage();
        }
    }, [track_scrolling_id, loadNextPage])

    useLayoutEffect(() => {
        document.addEventListener('scroll', checkScroll);
        return (() => document.removeEventListener('scroll', checkScroll));
    })

    const expandSku = (sku) => {
        history.push(LINKS.Shopping + "/" + sku);
    };

    const setInCart = (name, sku, operation, quantity) => {
        if (!session?.tag || !session?.token) return;
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        let cart_copy = JSON.parse(JSON.stringify(cart));
        cart_copy.items.push({ 'sku': sku.sku, 'quantity': quantity });
        updateCart(session, session.tag, cart_copy)
            .then(() => {
                if (operation === 'ADD')
                    alert(`${quantity} ${name}(s) added to cart!`)
                else if (operation === 'SET')
                    alert(`${name} quantity updated to ${quantity}!`)
                else if (operation === 'DELETE')
                    alert(`${name} 'removed from' cart!`)
            })
            .catch(err => {
                console.error(err, cart_copy);
                alert('Operation failed. Please try again');
            })
    }

    useEffect(() => {
        if (curr_index < 0) {
            setPopup(null);
            return;
        }
        let popup_data = plants[curr_index];
        setPopup(
            <Modal scrollable={true} onClose={() => history.goBack()}>
                <ExpandedPlant plant={popup_data}
                    thumbnail={thumbnails?.length >= curr_index ? thumbnails[curr_index] : null}
                    onCart={setInCart} />
            </Modal>
        );
    }, [plants, curr_index])

    return (
        <div className={classes.root} id={track_scrolling_id}>
            {popup}
            {plants?.map((item, index) =>
                <PlantCard key={index}
                    cart={cart}
                    onClick={() => expandSku(item.skus[0].sku)}
                    plant={item}
                    thumbnail={thumbnails?.length >= index ? thumbnails[index] : null}
                    onSetInCart={setInCart} />)}
        </div>
    );
}

ShoppingList.propTypes = {
    page_size: PropTypes.number,
    sort: PropTypes.string,
    filters: PropTypes.object,
    searchString: PropTypes.string,
};

export default ShoppingList;

const popupStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
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
    bottom: {
        width: '100%',
        height: '20%',
        alignItems: 'center',
    },
    displayImage: {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        bottom: '0%',
    },
}));

function ExpandedPlant({
    plant,
    thumbnail,
    onCart,
}) {
    console.log('EXPANDED PLANT', plant)
    const classes = popupStyles();
    const [quantity, setQuantity] = useState(1);
    const [image, setImage] = useState(null);

    useEffect(() => {
        getImage(plant.display_id, 'l').then(response => {
            setImage(response.image);
        }).catch(error => {
            console.error(error);
        })
    }, [])

    let order_options = plant.skus?.map(s => {
        return {
            label: `#${s.size} : ${displayPrice(s.price)}`,
            value: s
        }
    });
    const [selected, setSelected] = useState(order_options[0].value);

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
                <Tooltip title={title}>
                    <Icon width="25px" height="25px" title={title} alt={alt} />
                    <p>: {field_string}</p>
                </Tooltip>
            </div>
        )
    }

    return (
        <div>
            <div className={classes.header}>
                <Typography gutterBottom variant="h4" component="h1">{plant.latin_name}</Typography>
                <Typography gutterBottom variant="h5" component="h2">{plant.common_name}</Typography>
            </div>
            <div className={classes.left}>
                {display_image}
            </div>
            <div className={classes.right}>
                {plant.description ?
                    <Collapsible style={{ height: '20%' }} title="Description">
                        <p>{plant.description}</p>
                    </Collapsible>
                    : null}
                <Collapsible style={{ height: '30%' }} title="General Information">
                    <div>
                        {/* TODO availability, sizes */}
                    </div>
                    <div>
                        <p>General</p>
                        {traitIconList("zones", MapIcon, "Zones")}
                        {traitIconList("physiographic_regions", MapIcon, "Physiographic Region")}
                        {traitIconList("attracts_pollinators_and_wildlifes", BeeIcon, "Attracted Pollinators and Wildlife")}
                        {traitIconList("drought_tolerance", NoWaterIcon, "Drought Tolerance")}
                        {traitIconList("salt_tolerance", SaltIcon, "Salt Tolerance")}
                    </div>
                    <div>
                        <p>Bloom</p>
                        {traitIconList("bloom_colors", ColorWheelIcon, "Bloom Colors")}
                        {traitIconList("bloom_times", CalendarIcon, "Bloom Times")}
                    </div>
                    <div>
                        <p>Light</p>
                        {traitIconList("light_ranges", RangeIcon, "Light Range")}
                        {traitIconList("optimal_light", SunIcon, "Optimal Light")}
                    </div>
                    <div>
                        <p>Soil</p>
                        {traitIconList("soil_moistures", EvaporationIcon, "Soil Moisture")}
                        {traitIconList("soil_phs", PHIcon, "Soil PH")}
                        {traitIconList("soil_types", SoilTypeIcon, "Soil Type")}
                    </div>
                </Collapsible>
            </div>
                <Grid className={classes.bottom} container spacing={1}>
                    <Grid item xs={6}>
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
                    <Grid item xs={1}>
                        <IconButton onClick={() => onCart(plant.latin_name ?? plant.common_name ?? 'plant', selected, 'ADD', quantity)}>
                            <AddShoppingCartIcon />
                        </IconButton>
                    </Grid>
                </Grid>
        </div>
    );
}

ExpandedPlant.propTypes = {
    plant: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    onCart: PropTypes.func.isRequired
};

export { ExpandedPlant };
