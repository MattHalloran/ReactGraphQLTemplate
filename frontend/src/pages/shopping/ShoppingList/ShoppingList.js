import React, { useState, useLayoutEffect, useEffect, useCallback, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledPlantCard, StyledExpandedPlant } from "./ShoppingList.styled";
import { getImages, getImage, getInventory, getInventoryPage, updateCart } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { LINKS, PUBS, SORT_OPTIONS } from "utils/consts";
import Modal from "components/wrappers/Modal/Modal";
import { NoImageIcon, NoWaterIcon, RangeIcon, PHIcon, SoilTypeIcon, BagPlusIcon, ColorWheelIcon, CalendarIcon, EvaporationIcon, BeeIcon, MapIcon, SaltIcon, SunIcon } from 'assets/img';
import Tooltip from 'components/Tooltip/Tooltip';
import { getSession, getTheme, getCart } from "utils/storage";
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import { displayPrice } from 'utils/displayPrice';
import DropDown from 'components/inputs/DropDown/DropDown';

function ShoppingList({
    page_size,
    sort = SORT_OPTIONS[0].value,
    filters,
    searchString = '',
}) {
    page_size = page_size ?? Math.ceil(window.innerHeight / 150) * Math.ceil(window.innerWidth / 150);
    const [session, setSession] = useState(getSession());
    const [theme, setTheme] = useState(getTheme());
    const [cart, setCart] = useState(getCart());
    const [popup, setPopup] = useState(null);
    // Plant data for every loaded plant
    const [loaded_plants, setLoadedPlants] = useState([]);
    // SKU codes for all SKUs, not just displayed ones
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
        let ids = plants.map(p => p.id);
        console.log('IDS ARE', ids, plants);
        getImages(ids, 'm').then(response => {
            setThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });
    }, [plants])

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    useEffect(() => {
        console.log('CURR INDEX UPDATED', curr_index)
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
                all_plant_ids.current = response.all_plant_ids;
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    // Determine which skus will be visible to the user (i.e. not filtered out)
    useEffect(() => {
        //Find all applied filters
        let applied_filters = [];
        for (const key in filters) {
            //console.log('CURR KEY IS', key)
            let filter_group = filters[key];
            //console.log('FILTER GROUP IS', filter_group)
            for (let i = 0; i < filter_group.length; i++) {
                if (filter_group[i].checked) {
                    applied_filters.push([key, filter_group[i].label]);
                }
            }
        }
        //If no filters are set, show all plants
        if (applied_filters.length == 0) {
            setPlants(loaded_plants);
            return;
        }
        //Select all plants that contain the filters
        let filtered_plants = [];
        for (let i = 0; i < loaded_plants.length; i++) {
            let curr_plant = loaded_plants[i];
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
    }, [loaded_plants, filters])

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
        if (!session?.email || !session?.token) return;
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        let cart_copy = JSON.parse(JSON.stringify(cart));
        cart_copy.items.push({'sku': sku.sku, 'quantity':quantity});
        updateCart(session, session.email, cart_copy)
            .then(() => {
                if (operation === 'ADD')
                    alert(`${quantity} ${name}(s) added to cart!`)
                else if (operation === 'SET')
                    alert(`${name} quantity updated to ${quantity}!`)
                else if (operation === 'DELETE')
                    alert(`${name} 'removed from' cart!`)
            })
            .catch(err => {
                console.error(err);
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
            <Modal onClose={() => history.goBack()}>
                <ExpandedPlant plant={popup_data}
                    thumbnail={thumbnails?.length >= curr_index ? thumbnails[curr_index] : null}
                    onCart={setInCart}
                    theme={theme} />
            </Modal>
        );
    }, [plants, curr_index])

    return (
        <StyledShoppingList id={track_scrolling_id}>
            {popup}
            {plants.map((item, index) =>
                <PlantCard key={index}
                    theme={theme}
                    cart={cart}
                    onClick={expandSku}
                    plant={item}
                    thumbnail={thumbnails?.length >= index ? thumbnails[index] : null}
                    onSetInCart={setInCart} />)}
        </StyledShoppingList>
    );
}

ShoppingList.propTypes = {
    page_size: PropTypes.number,
    sort: PropTypes.string,
    filters: PropTypes.object,
    searchString: PropTypes.string,
};

export default ShoppingList;

function PlantCard({
    plant,
    thumbnail,
    onClick,
}) {
    const [theme] = useState(getTheme());

    let sizes = plant.skus.map(s => (
        <div>Size: #{s.size}<br/>Price: {displayPrice(s.price)}<br/>Avail: {s.availability}</div>
    ));

    let display_image;
    if (thumbnail) {
        display_image = <img src={`data:image/jpeg;base64,${thumbnail}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    return (
        <StyledPlantCard theme={theme} onClick={() => onClick(plant.skus[0].sku)}>
            <div className="title">
                <h2>{plant.latin_name}</h2>
                {plant.common_name ? <br /> : null}
                <h3>{plant.common_name}</h3>
            </div>
            <div className="display-image-container">
                {display_image}
            </div>
            <div className="size-container">
                {sizes}
            </div>
        </StyledPlantCard>
    );
}

PlantCard.propTypes = {
    plant: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { PlantCard };

function ExpandedPlant({
    plant,
    thumbnail,
    onCart,
}) {
    const [theme, setTheme] = useState(getTheme());
    const [quantity, setQuantity] = useState(1);
    const [image, setImage] = useState(null);

    useEffect(() => {
        getImage(plant.id, 'l').then(response => {
            setImage(response.image);
        }).catch(error => {
            console.error(error);
        })
    },[])

    let order_options = plant.skus?.map(s => {
        return {
            label: `#${s.size} : ${displayPrice(s.price)}`,
            value: s
        }
    });
    const [selected, setSelected] = useState(order_options[0].value);

    let display_image;
    if (image) {
        display_image = <img src={`data:image/jpeg;base64,${image}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    const handleSortChange = (item, _) => {
        setSelected(item.value);
    }

    const traitIconList = (field, Icon, title, alt) => {
        if (!plant || !plant[field] || !Array.isArray(plant[field]) ||
            plant[field].length === 0) return null;
        if (!alt) alt = title;
        let field_map = plant[field].map((f) => f.value)
        return (
            <div className="trait-container">
                <Tooltip content={title}>
                    <Icon className="trait-icon" width="25px" height="25px" title={title} alt={alt} />
                    <p>: {field_map.join(', ')}</p>
                </Tooltip>
            </div>
        )
    }

    return (
        <StyledExpandedPlant theme={theme}>
            <div className="title">
                <h1>{plant.latin_name}</h1>
                {plant.common_name ? <br /> : null}
                <h3>{plant.common_name}</h3>
            </div>
            <div className="main-div">
                {display_image}
                {plant.description ?
                    <Collapsible className="description-container" style={{ height: '20%' }} title="Description">
                        <p>{plant.description}</p>
                    </Collapsible>
                    : null}
                <Collapsible className="trait-list" style={{ height: '30%' }} title="General Information">
                    <div className="sku">
                        {/* TODO availability, sizes */}
                    </div>
                    <div className="general">
                        <p>General</p>
                        {traitIconList("zones", MapIcon, "Zones")}
                        {traitIconList("physiographic_regions", MapIcon, "Physiographic Region")}
                        {traitIconList("attracts_pollinators_and_wildlifes", BeeIcon, "Attracted Pollinators and Wildlife")}
                        {traitIconList("drought_tolerance", NoWaterIcon, "Drought Tolerance")}
                        {traitIconList("salt_tolerance", SaltIcon, "Salt Tolerance")}
                    </div>
                    <div className="bloom">
                        <p>Bloom</p>
                        {traitIconList("bloom_colors", ColorWheelIcon, "Bloom Colors")}
                        {traitIconList("bloom_times", CalendarIcon, "Bloom Times")}
                    </div>
                    <div className="light">
                        <p>Light</p>
                        {traitIconList("light_ranges", RangeIcon, "Light Range")}
                        {traitIconList("optimal_light", SunIcon, "Optimal Light")}
                    </div>
                    <div className="soil">
                        <p>Soil</p>
                        {traitIconList("soil_moistures", EvaporationIcon, "Soil Moisture")}
                        {traitIconList("soil_phs", PHIcon, "Soil PH")}
                        {traitIconList("soil_types", SoilTypeIcon, "Soil Type")}
                    </div>
                </Collapsible>
            </div>
            <div className="icon-container bottom-div">
                <div className="selecter">
                    <label>Option</label>
                    <DropDown options={order_options} onChange={handleSortChange} initial_value={order_options[0]} />
                </div>
                <div className="quanter">
                    <label>Quantity</label>
                    <QuantityBox
                        min_value={0}
                        max_value={Math.max.apply(Math, plant.skus.map(s => s.availability))}
                        initial_value={1}
                        value={quantity}
                        valueFunc={setQuantity} />
                </div>
                <BagPlusIcon
                    className="bag"
                    width="30px"
                    height="30px"
                    onClick={() => onCart(plant.latin_name ?? plant.common_name ?? 'plant', selected, 'ADD', quantity)} />
            </div>
        </StyledExpandedPlant>
    );
}

ExpandedPlant.propTypes = {
    group: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    onCart: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { ExpandedPlant };
