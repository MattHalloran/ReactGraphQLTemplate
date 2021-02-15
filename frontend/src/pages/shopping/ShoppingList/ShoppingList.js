import React, { useState, useLayoutEffect, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledSkuCard, StyledExpandedSku } from "./ShoppingList.styled";
import { getImageFromSku, getInventory, getInventoryPage, setLikeSku, setSkuInCart } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { LINKS, PUBS, SORT_OPTIONS } from "utils/consts";
import Modal from "components/wrappers/Modal/Modal";
import { HeartIcon, HeartFilledIcon, NoImageIcon, NoWaterIcon, RangeIcon, PHIcon, SoilTypeIcon, BagPlusIcon, ColorWheelIcon, CalendarIcon, EvaporationIcon, BeeIcon, MapIcon, SaltIcon, SunIcon } from 'assets/img';
import Tooltip from 'components/Tooltip/Tooltip';
import { getSession, getTheme, getCart, getLikes } from "utils/storage";
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';

function ShoppingList({
    page_size,
    sort = SORT_OPTIONS[0].value,
    filters,
    searchString = '',
}) {
    page_size = page_size ?? Math.ceil(window.innerHeight / 150) * Math.ceil(window.innerWidth / 150);
    const [session, setSession] = useState(getSession());
    const [theme, setTheme] = useState(getTheme());
    const [likes, setLikes] = useState(getLikes());
    const [cart, setCart] = useState(getCart());
    const [popup, setPopup] = useState(null);
    const [cards, setCards] = useState([]);
    const [visible_cards, setVisibleCards] = useState([]);
    const [all_skus, setAllSkus] = useState([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    let curr_index = visible_cards?.findIndex(c => c.sku === urlParams.sku) ?? -1
    const loading = useRef(false);

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let likesSub = PubSub.subscribe(PUBS.Likes, (_, o) => setLikes(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(likesSub);
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
                setCards(response.page_results);
                setAllSkus(skus => skus.concat(response.all_skus));
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
            console.log('SETTING VISIBLE CARDS', cards);
            setVisibleCards(cards);
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
            console.log('SETTING VISIBLE CARDS', cards);
            setVisibleCards(cards);
            return;
        }
        //Select all skus that contain the filters
        let filtered_cards = [];
        for (let i = 0; i < cards.length; i++) {
            let curr_plant = cards[i].plant;
            //console.log('ALL CARDS IS', cards);
            //console.log('CURR PLANT ISSS', curr_plant, i)
            filterloop:
            for (let j = 0; j < applied_filters.length; j++) {
                let trait = applied_filters[j][0];
                let value = applied_filters[j][1];

                // Grab data depending on if the field is for the sku or its associated plant
                let data;
                if (trait === 'sizes') {
                    data = cards[i][trait];
                } else {
                    data = curr_plant[trait];
                }

                if (Array.isArray(data) && data.length > 0) {
                    if (data.some(o => o.value === value)) {
                        filtered_cards.push(cards[i]);
                        break filterloop;
                    }
                } else if (data?.value === value) {
                    filtered_cards.push(cards[i]);
                    break filterloop;
                }
            }
        }
        console.log('SETTING VISIBLE CARDS', filtered_cards);
        setVisibleCards(filtered_cards);
    }, [cards, filters])

    const loadNextPage = useCallback(() => {
        if (loading.current || cards.length >= all_skus.length) return;
        loading.current = true;
        //Grab all card thumbnail images
        let load_to = Math.min(visible_cards.length, cards.length + page_size - 1);
        let page_skus = all_skus.splice(visible_cards.length, load_to);
        if (page_skus.length == 0) {
            loading.current = false;
            return;
        }
        getInventoryPage(page_skus).then(response => {
            setCards(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load cards!", error);
        }).finally(() => {
            loading.current = false;
        })
        return () => loading.current = false;
    }, [cards, page_size, visible_cards]);

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

    const setLike = (sku, liked) => {
        if (!session?.email || !session?.token) return;
        setLikeSku(session.email, session.token, sku, liked);
    }

    const setInCart = (sku, operation, quantity) => {
        if (!session?.email || !session?.token) return;
        let display_name = sku?.plant?.latin_name ?? sku?.plant?.common_name ?? 'plant';
        setSkuInCart(session.email, session.token, sku.sku, operation, quantity)
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
        let popup_data = visible_cards[curr_index];
        setPopup(
            <Modal onClose={() => history.goBack()}>
                <ExpandedSku sku={popup_data}
                    cart={cart}
                    is_liked={likes?.some(l => l.sku === popup_data.sku)}
                    onLike={setLike}
                    onCart={setInCart}
                    theme={theme} />
            </Modal>
        );
    }, [visible_cards, curr_index])

    return (
        <StyledShoppingList id={track_scrolling_id}>
            {popup}
            {visible_cards.map((item, index) =>
                <SkuCard key={index}
                    theme={theme}
                    likes={likes}
                    cart={cart}
                    onClick={expandSku}
                    sku={item}
                    onSetLike={setLike}
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
    sku,
    onClick,
}) {
    const [theme, setTheme] = useState(getTheme());
    const plant = sku?.plant;

    //TODO SKUS need to be grouped by size, if they share the same plant
    let temp_sizes = [['1', 2234], ['2', 1], ['3', 23]];//sku.size
    let sizes = temp_sizes?.map(data => (
        <div>#{data[0]}: {data[1]}</div>
    ));

    let display_image;
    if (sku?.display_image) {
        display_image = <img src={`data:image/jpeg;base64,${sku.display_image}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    return (
        <StyledSkuCard theme={theme} onClick={() => onClick(sku.sku)}>
            <h2 className="title">{plant.latin_name}</h2>
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
    sku: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { SkuCard };

function ExpandedSku({
    sku,
    cart,
    is_liked = false,
    onLike,
    onCart,
}) {
    console.log('EEEEEE', cart)
    const plant = sku?.plant;
    const [theme, setTheme] = useState(getTheme());
    const [quantity, setQuantity] = useState(1);

    let display_image;
    if (sku?.display_image) {
        display_image = <img src={`data:image/jpeg;base64,${sku.display_image}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    let heartIcon;
    if (is_liked) {
        heartIcon = (
            <HeartIcon
                width="40px"
                height="40px"
                onClick={onLike(sku?.sku, true)} />
        )
    } else {
        heartIcon = (
            <HeartFilledIcon
                width="40px"
                height="40px"
                onClick={onLike(sku?.sku, false)} />
        )
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
            <h1 className="title">{plant?.latin_name}</h1>
            {plant?.common_name ? <h3 className="subtitle">{plant.common_name}</h3> : null}
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
            <div className="icon-container bottom-div">
                {heartIcon}
                <div className="quantity-div">
                    <QuantityBox
                        min_value={0}
                        max_value={sku?.quantity ?? 100}
                        initial_value={1}
                        value={quantity}
                        valueFunc={setQuantity} />
                    <BagPlusIcon
                        width="30px"
                        height="30px"
                        onClick={() => onCart(sku, 'ADD', quantity)} />
                </div>
            </div>
        </StyledExpandedSku>
    );
}

ExpandedSku.propTypes = {
    sku: PropTypes.object.isRequired,
    cart: PropTypes.object.isRequired,
    is_liked: PropTypes.bool.isRequired,
    onLike: PropTypes.func.isRequired,
    onCart: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { ExpandedSku };
