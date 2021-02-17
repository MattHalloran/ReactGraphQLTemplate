import React, { useState, useLayoutEffect, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledSkuCard, StyledExpandedSku } from "./ShoppingList.styled";
import { getSkuThumbnails, getImageFromSku, getInventory, getInventoryPage, setSkuInCart } from "query/http_promises";
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
    // SKU data for every loaded SKU
    const [loaded_skus, setLoadedSkus] = useState([]);
    // SKU codes for all SKUs, not just displayed ones
    const all_skus = useRef([]);
    // List of data passed to SKU cards. Each card represents 1 or more SKUs,
    // that share the same plant info
    const [sku_groups, setSkuGroups] = useState([]);
    // Thumbnail data for every sku group
    const [thumbnails, setThumbnails] = useState([]);
    // Full image data for every sku group
    const [full_images, setFullImages] = useState([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    // Find the current SKU group index, by any of the group's SKUs
    let curr_index = sku_groups?.findIndex(c => c.findIndex(s => s.sku === urlParams.sku) >= 0) ?? -1
    const loading = useRef(false);

    // Compares two sku dictionaries for equality
    const skus_equal = (a, b) => {
        // Check defined latin names
        let a_latin = a.plant?.latin_name;
        let b_latin = b.plant?.latin_name;
        if (a_latin && b_latin && a_latin === b_latin) return true;
        // Check defined common names
        let a_common = a.plant?.common_name;
        let b_common = b.plant?.common_name;
        if (a_common && b_common && a_common === b_common) return true;
        return false;

    }

    // Combine SKUs that share the same plant
    const combine_skus = (skus) => {
        let combined = [];
        for (let i = 0; i < skus.length; i++) {
            let sku = skus[i]
            let combined_index = combined.findIndex(s => skus_equal(s[0], sku));
            if (combined_index < 0) {
                combined.push([sku])
            } else {
                combined[combined_index].push(sku);
            }
        }
        console.log('SETTING SKU GROUP', combined)
        setSkuGroups(combined);
        // Using a SKU code from each group, request thumbnail images
        let codes = skus.map(s => s.sku);
        getSkuThumbnails(codes).then(response => {
            setThumbnails(response.thumbnails);
        }).catch(err => {
            console.error(err);
        });
    }

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
                setLoadedSkus(response.page_results);
                all_skus.current = response.all_skus;
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    // Determine which skus will be visible to the user (i.e. not filtered out)
    useEffect(() => {
        if (!filters) {
            combine_skus(loaded_skus);
            return;
        }

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
            combine_skus(loaded_skus);
            return;
        }
        //Select all skus that contain the filters
        let filtered_skus = [];
        for (let i = 0; i < loaded_skus.length; i++) {
            let curr_plant = loaded_skus[i].plant;
            filterloop:
            for (let j = 0; j < applied_filters.length; j++) {
                let trait = applied_filters[j][0];
                let value = applied_filters[j][1];

                // Grab data depending on if the field is for the sku or its associated plant
                let data;
                if (trait === 'sizes') {
                    data = loaded_skus[i][trait];
                } else {
                    data = curr_plant[trait];
                }

                if (Array.isArray(data) && data.length > 0) {
                    if (data.some(o => o.value === value)) {
                        filtered_skus.push(loaded_skus[i]);
                        break filterloop;
                    }
                } else if (data?.value === value) {
                    filtered_skus.push(loaded_skus[i]);
                    break filterloop;
                }
            }
        }
        combine_skus(filtered_skus);
    }, [loaded_skus, filters])

    const loadNextPage = useCallback(() => {
        if (loading.current || loaded_skus.length >= all_skus.current.length) return;
        loading.current = true;
        //Grab all card thumbnail images
        let load_to = Math.min(all_skus.current.length, loaded_skus.length + page_size - 1);
        let clone = all_skus.current.slice();
        let page_skus = clone.splice(loaded_skus.length, load_to);
        if (page_skus.length == 0) {
            loading.current = false;
            return;
        }
        getInventoryPage(page_skus).then(response => {
            setLoadedSkus(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load SKUs!", error);
        }).finally(() => {
            loading.current = false;
        })
        return () => loading.current = false;
    }, [loaded_skus, all_skus, page_size]);

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

    const setInCart = (sku, operation, quantity) => {
        if (!session?.email || !session?.token) return;
        let display_name = sku?.plant?.latin_name ?? sku?.plant?.common_name ?? 'plant';
        setSkuInCart(session, sku.sku, operation, quantity)
            .then(() => {
                if (operation === 'ADD')
                    alert(`${quantity} ${display_name}(s) added to cart!`)
                else if (operation === 'SET')
                    alert(`${display_name} quantity updated to ${quantity}!`)
                else if (operation === 'DELETE')
                    alert(`${display_name} 'removed from' cart!`)
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
        let popup_data = sku_groups[curr_index];
        setPopup(
            <Modal onClose={() => history.goBack()}>
                <ExpandedSku group={popup_data}
                    thumbnail={thumbnails.length >= curr_index ? thumbnails[curr_index] : null}
                    onCart={setInCart}
                    theme={theme} />
            </Modal>
        );
    }, [sku_groups, curr_index])

    return (
        <StyledShoppingList id={track_scrolling_id}>
            {popup}
            {sku_groups.map((item, index) =>
                <SkuCard key={index}
                    theme={theme}
                    cart={cart}
                    onClick={expandSku}
                    group={item}
                    thumbnail={thumbnails.length >= index ? thumbnails[index] : null}
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

function SkuCard({
    group,
    thumbnail,
    onClick,
}) {
    const [theme, setTheme] = useState(getTheme());
    const plant = group[0].plant;

    let sizes = group?.map(s => (
        <div>#{s.size}: {displayPrice(s.price)} | {s.availability}</div>
    ));

    let display_image;
    if (thumbnail) {
        display_image = <img src={`data:image/jpeg;base64,${thumbnail}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    return (
        <StyledSkuCard theme={theme} onClick={() => onClick(group[0].sku)}>
            <div className="title">
                <h2>{plant?.latin_name}</h2>
                {plant?.common_name ? <br /> : null}
                <h3>{plant?.common_name ? plant.common_name : null}</h3>
            </div>
            <div className="display-image-container">
                {display_image}
            </div>
            <div className="size-container">
                {sizes}
            </div>
        </StyledSkuCard>
    );
}

SkuCard.propTypes = {
    group: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { SkuCard };

function ExpandedSku({
    group,
    thumbnail,
    onCart,
}) {
    const plant = group[0].plant;
    const [theme, setTheme] = useState(getTheme());
    const [quantity, setQuantity] = useState(1);
    const [image, setImage] = useState(null);

    useEffect(() => {
        getImageFromSku(group[0].sku).then(response => {
            setImage(response.image);
        }).catch(error => {
            console.error(error);
        })
    },[])

    let order_options = group?.map(s => {
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
        <StyledExpandedSku theme={theme}>
            <div className="title">
                <h1>{plant?.latin_name}</h1>
                {plant?.common_name ? <br /> : null}
                <h3>{plant?.common_name ? plant.common_name : null}</h3>
            </div>
            <div className="main-div">
                {display_image}
                {plant?.description ?
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
                <DropDown className="selecter" options={order_options} onChange={handleSortChange} initial_value={order_options[0]} />
                <QuantityBox
                    className="quanter"
                    min_value={0}
                    max_value={group[0]?.quantity ?? 100}
                    initial_value={1}
                    value={quantity}
                    valueFunc={setQuantity} />
                <BagPlusIcon
                    className="bag"
                    width="30px"
                    height="30px"
                    onClick={() => onCart(selected, 'ADD', quantity)} />
            </div>
        </StyledExpandedSku>
    );
}

ExpandedSku.propTypes = {
    group: PropTypes.object.isRequired,
    thumbnail: PropTypes.string,
    onCart: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { ExpandedSku };
