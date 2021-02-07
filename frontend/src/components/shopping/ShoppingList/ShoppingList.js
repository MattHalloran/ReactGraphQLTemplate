import React, { useState, useLayoutEffect, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledSkuCard, StyledExpandedSku } from "./ShoppingList.styled";
import { getImageFromHash, getImageFromSku, getInventory, getInventoryPage, setLikeSku, setSkuInCart } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { BUSINESS_NAME, LINKS, PUBS, SORT_OPTIONS } from "consts";
import Modal from "components/shared/wrappers/Modal/Modal";
import HeartIcon from 'assets/img/HeartIcon';
import HeartFilledIcon from 'assets/img/HeartFilledIcon';
import BagPlusIcon from 'assets/img/BagPlusIcon';
import BagCheckFillIcon from 'assets/img/BagCheckFillIcon';
import FullscreenIcon from 'assets/img/FullscreenIcon';
import ChevronLeftIcon from 'assets/img/ChevronLeftIcon';
import ChevronRightIcon from 'assets/img/ChevronRightIcon';
import Bee from 'assets/img/BeeIcon';
import MapIcon from 'assets/img/MapIcon';
import SaltIcon from 'assets/img/SaltIcon';
import SunIcon from 'assets/img/SunIcon';
import ColorWheelIcon from 'assets/img/ColorWheelIcon';
import CalendarIcon from 'assets/img/CalendarIcon';
import EvaporationIcon from 'assets/img/EvaporationIcon';
import NoImageIcon from 'assets/img/NoImageIcon';
import NoWaterIcon from 'assets/img/NoWaterIcon';
import RangeIcon from 'assets/img/RangeIcon';
import PHIcon from 'assets/img/PHIcon';
import SoilTypeIcon from 'assets/img/SoilTypeIcon';
import Tooltip from 'components/shared/Tooltip/Tooltip';
import { getTheme } from "storage";
import makeid from "utils/makeID";

function ShoppingList({
    page_size,
    sort = SORT_OPTIONS[0].value,
    filters,
    session,
    theme = getTheme(),
}) {
    console.log('SESSION IN SHOPPING LIST IS', session);
    page_size = page_size ?? Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);
    let history = useHistory();
    const [likes, setLikes] = useState([]);
    const [cart, setCart] = useState([]);
    const [popup, setPopup] = useState(null);
    const [cards, setCards] = useState([]);
    const [visible_cards, setVisibleCards] = useState([]);
    const [all_skus, setAllSkus] = useState([]);
    // [sku, base64 data, alt]
    const [curr_sku, setCurrSku] = useState(null);
    const track_scrolling_id = 'scroll-tracked';
    const full_images = useRef({});
    const urlParams = useParams();
    const curr_index = useMemo(() => cards.current?.findIndex(c => c.sku === urlParams.sku) ?? -1, [cards, urlParams]);
    const loading = useRef(false);

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));
    // useHotkeys('arrowLeft', () => prevImage());
    // useHotkeys('arrowRight', () => nextImage());

    useEffect(() => {
        let likesSub = PubSub.subscribe(PUBS.Likes, (_, l) => setLikes(l));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, c) => setCart(c));
        return (() => {
            PubSub.unsubscribe(likesSub);
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    const loading_full_image = useRef(false);
    const loadImage = useCallback((index, sku) => {
        // If this function hasn't finished yet, or there is no sku to load
        if (loading_full_image.current || !sku) return;
        // First check if the image data has already been retrieved
        if (index in full_images.current) {
            setCurrSku(full_images.current[index]);
        } else {
            loading_full_image.current = true;
            // Request the image from the backend
            getImageFromSku(sku).then(response => {
                let image_data = [sku, `data:image/jpeg;base64,${response.image}`, response.alt];
                console.log('SETTING URR SKU', image_data)
                setCurrSku(image_data);
                full_images.current[index] = image_data;
            }).catch(error => {
                console.error('FAILED TO LOAD FULL IMAGE', error)
            }).finally(() => loading_full_image.current = false);
        }
    }, [loading_full_image, full_images])

    useEffect(() => {
        if (urlParams.sku) {
            loadImage(curr_index, urlParams.sku);
            PubSub.publish(PUBS.PopupOpen, true);
        } else {
            console.log('SETTING CURR SKU TO NULLS')
            setCurrSku([null, null, null]);
            PubSub.publish(PUBS.PopupOpen, false);
        }
    }, [urlParams, curr_index, loadImage])

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
                console.log('SET ALL SKUS', response.all_skus)
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    useLayoutEffect(() => {
        document.title = `Shopping | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', loadNextPage);
        return (() => document.removeEventListener('scroll', loadNextPage));
    })

    // Determine which skus will be visible to the user (i.e. not filtered out)
    useEffect(() => {
        if (!filters) {
            setVisibleCards(all_skus);
            return;
        }
        
        //Find all applied filters
        let applied_filters = [];
        console.log('fdsiafhdsaufkdks filter', filters)
        for (const key in filters) {
            console.log('CURR KEY IS', key)
            let filter_group = filters[key];
            console.log('FILTER GROUP IS', filter_group)
            for(let i = 0; i < filter_group.length; i++) {
                if (filter_group[i].checked) {
                    applied_filters.push([key, filter_group[i].label]);
                }
            }
        }
        //If no filters are set, show all plants
        if (applied_filters.length == 0) {
            setVisibleCards(cards);
            return;
        }
        //Select all skus that contain the filters
        let filtered_cards = [];
        for (let i = 0; i < cards.length; i++) {
            let curr_plant = cards[i].plant;
            console.log('ALL CARDS IS', cards);
            console.log('CURR PLANT ISSS', curr_plant, i)
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
        console.log('SETTING FILTERED CARDS TOOOOOO', filtered_cards);
        setVisibleCards(filtered_cards);
    }, [cards, filters])

    const readyToLoadPage = useCallback(() => {
        //If the image metadata hasn't been received, or
        //the next page is still loading
        if (loading.current) return false;
        //If all cards have already been loaded
        if (cards === null || cards.length === all_skus.length) {
            return false;
        }
        //If the first page hasn't loaded
        if (cards.length < page_size) return true;
        //If the scrollbar is near the bottom
        const divElement = document.getElementById(track_scrolling_id);
        return divElement.getBoundingClientRect().bottom <= 1.5 * window.innerHeight;
    }, [cards, all_skus, page_size]);

    const loadNextPage = useCallback(() => {
        if (!readyToLoadPage()) return;
        loading.current = true;
        //Grab all card thumbnail images
        let load_to = Math.min(visible_cards.length, cards.length + page_size - 1);
        let page_skus = visible_cards.splice(cards.length, load_to).map(c => c.sku);
        getInventoryPage(page_skus).then(response => {
            setCards(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load cards!", error);
            loading.current = false;
        });
    }, [cards, page_size, readyToLoadPage, visible_cards]);

    const prevImage = useCallback(() => {
        if (cards.length <= 0) return;
        // Default to last image if none open
        if (curr_index < 0) {
            history.push(LINKS.Shopping + '/' + visible_cards[cards.length - 1].sku);
        } else {
            // Find previous image index using modulus
            let prev_index = (curr_index + cards.length - 1) % visible_cards.length;
            history.replace(LINKS.Shopping + '/' + visible_cards[prev_index].sku);
        }
    }, [cards, visible_cards, curr_index, history]);

    const nextImage = useCallback(() => {
        if (cards.length <= 0) return;
        // Default to first image if none open
        if (curr_index < 0) {
            history.push(LINKS.Shopping + '/' + visible_cards[0].sku);
        } else {
            // Find next image index using modulus
            let next_index = (curr_index + 1) % visible_cards.length;
            history.replace(LINKS.Shopping + '/' + visible_cards[next_index].sku);
        }
    }, [cards, visible_cards, curr_index, history]);


    const expandSku = (sku) => {
        history.push(LINKS.Shopping + "/" + sku);
    };

    const setLike = (sku, liked) => {
        if (!session?.email || !session?.token) return;
        setLikeSku(session.email, session.token, sku, liked);
    }

    const setInCart = (sku, quantity, in_cart) => {
        if (!session?.email || !session?.token) return;
        setSkuInCart(session.email, session.token, sku, quantity, in_cart);
    }

    useEffect(() => {
        console.log('ALL SKUS UPDATEDDDDDDDDD', curr_sku)
        if (!curr_sku || !curr_sku[0]) {
            setPopup(null);
            return;
        }
        let index = visible_cards.map(c => c.sku).indexOf(curr_sku[0]);
        let popup_data = cards[index];
        setPopup(
            <Modal onClose={() => history.goBack()}>
                <ExpandedSku sku={popup_data} goLeft={prevImage} goRight={nextImage} theme={theme} />
            </Modal>
        );
    }, [visible_cards, curr_sku])

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
    session: PropTypes.object,
    theme: PropTypes.object,
};

export default ShoppingList;

function SkuCard({
    likes,
    cart,
    sku,
    onClick,
    onSetLike,
    onSetInCart,
    theme = getTheme(),
}) {
    const plant = sku?.plant;

    let temp_sizes = [['1', 2234], ['2', 1], ['3', 23]];//sku.sizes
    let sizes = temp_sizes?.map(data => (
        <div>#{data[0]}: {data[1]}</div>
    ));

    let display_image;
    if (sku.display_image) {
        display_image = <img src={`data:image/jpeg;base64,${sku.display_image}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    let heartIcon;
    if (!likes?.some(l => l.sku === sku.sku)) {
        heartIcon = (
            <HeartIcon
                width="40px"
                height="40px"
                onClick={() => onSetLike(sku.sku, true)} />
        )
    } else {
        heartIcon = (
            <HeartFilledIcon
                width="40px"
                height="40px"
                onClick={() => onSetLike(sku.sku, false)} />
        )
    }

    let cartIcon;
    if (!cart?.some(c => c.sku === sku.sku)) {
        cartIcon = (
            <BagPlusIcon
                width="40px"
                height="40px"
                onClick={() => onSetInCart(sku.sku, 1, true)} />
        )
    } else {
        cartIcon = (
            <BagCheckFillIcon
                width="40px"
                height="40px"
                onClick={() => onSetInCart(sku.sku, 1, false)} />
        )
    }

    return (
        <StyledSkuCard theme={theme}>
            <h1 className="title">{plant.latin_name}</h1>
            <div className="display-image-container">
                {display_image}
            </div>
            <div className="size-container">
                {sizes}
            </div>
            <div className="icon-container">
                {heartIcon}
                {cartIcon}
                <FullscreenIcon
                    width="40px"
                    height="40px"
                    title="Show more"
                    onClick={() => onClick(sku.sku)} />
            </div>
        </StyledSkuCard>
    );
}

SkuCard.propTypes = {
    likes: PropTypes.array,
    cart: PropTypes.array,
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onSetLike: PropTypes.func.isRequired,
    onSetInCart: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { SkuCard };

function ExpandedSku({
    sku,
    goLeft,
    goRight,
    theme = getTheme(),
}) {
    console.log('EEEEEE', sku)
    const plant = sku?.plant;

    let display_image;
    if (sku.display_image) {
        display_image = <img src={`data:image/jpeg;base64,${sku.display_image}`} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    // const iconFactory = (src, alt) => {
    //   return (
    //     <img className="" src={src} alt={alt}/>
    //   );
    // }

    // const bloomColorFactory = (color) => {
    //   return (
    //     <div className="circle" style={{color: color}}/>
    //   )
    // }

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
            <ChevronLeftIcon width="50px" height="50px" className="arrow left" onClick={goLeft} />
            <ChevronRightIcon width="50px" height="50px" className="arrow right" onClick={goRight} />
            <div className="main-content">
                <h1 className="title">{plant?.latin_name}</h1>
                {plant?.common_name ? <h3 className="subtitle">{plant.common_name}</h3> : null}
                {display_image}
                {plant?.description ?
                    <div className="description-container">
                        <p className="center">Description</p>
                        <p>{plant.description}</p>
                    </div>
                    : null}
                <div className="trait-list">
                    <div className="sku">
                        {/* TODO availability, sizes */}
                    </div>
                    <div className="general">
                        <p>General Information</p>
                        {traitIconList("zones", MapIcon, "Zones")}
                        {traitIconList("physiographic_regions", MapIcon, "Physiographic Region")}
                        {traitIconList("attracts_pollinators_and_wildlifes", Bee, "Attracted Pollinators and Wildlife")}
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
                </div>
                <div className="order-div">

                </div>
            </div>
        </StyledExpandedSku>
    );
}

ExpandedSku.propTypes = {
    sku: PropTypes.object.isRequired,
    goLeft: PropTypes.func.isRequired,
    goRight: PropTypes.func.isRequired,
    theme: PropTypes.object,
};

export { ExpandedSku };
