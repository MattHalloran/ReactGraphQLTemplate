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
import { getTheme } from "storage";

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
        let mounted = true;
        getInventory(sort, page_size, false)
            .then((response) => {
                if (!mounted) return;
                setCards(response.page_results);
                console.log('SETING ALL SKUS', response)
                setAllSkus(skus => skus.concat(response.all_skus));
                console.log('SET ALL SKUS', response.all_skus)
            })
            .catch((error) => {
                console.log("Failed to load inventory");
                console.error(error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    useLayoutEffect(() => {
        document.title = `Shopping | ${BUSINESS_NAME}`;
        document.addEventListener('scroll', loadNextPage);
        return (() => document.removeEventListener('scroll', loadNextPage));
    })

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
        let load_to = Math.min(all_skus.length, cards.length + page_size - 1);
        let page_skus = all_skus.splice(cards.length, load_to);
        getInventoryPage(page_skus).then(response => {
            setCards(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load cards!", error);
            loading.current = false;
        });
    }, [cards, page_size, readyToLoadPage, all_skus]);

    const prevImage = useCallback(() => {
        if (cards.length <= 0) return;
        // Default to last image if none open
        if (curr_index < 0) {
            history.push(LINKS.Shopping + '/' + all_skus[cards.length - 1]);
        } else {
            // Find previous image index using modulus
            let prev_index = (curr_index + cards.length - 1) % all_skus.length;
            history.replace(LINKS.Shopping + '/' + all_skus[prev_index]);
        }
    }, [cards, all_skus, curr_index, history]);

    const nextImage = useCallback(() => {
        if (cards.length <= 0) return;
        // Default to first image if none open
        if (curr_index < 0) {
            history.push(LINKS.Shopping + '/' + all_skus[0]);
        } else {
            // Find next image index using modulus
            let next_index = (curr_index + 1) % all_skus.length;
            history.replace(LINKS.Shopping + '/' + all_skus[next_index]);
        }
    }, [cards, all_skus, curr_index, history]);


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
        all_skus.map(([e]) => console.log(e))
        let index = all_skus.map(([e]) => e).indexOf(curr_sku[0]);
        let popup_data = cards[index];
        console.log('ALL SKUS', all_skus)
        console.log('POPUP DATA', index, popup_data)
        setPopup(
            <Modal onClose={() => history.goBack()}>
                <ExpandedSku sku={popup_data} goLeft={prevImage} goRight={nextImage} theme={theme}/>
            </Modal>
        );
    }, [all_skus, curr_sku])

    return (
        <StyledShoppingList id={track_scrolling_id}>
            {popup}
            {cards.map((item, index) =>
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

    let sizes = sku.sizes?.map(size => (
        <div className="size">{size}</div>
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
      SOME TEXT
            { sizes}
      Availability: hfhdkjaf
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
    const [src, setSrc] = useState(null);

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

    if (plant) {
        getImageFromHash(plant.flower_images[0].hash)
            .then((response) => {
                setSrc(`data:image/jpeg;base64,${response.image}`);
            })
            .catch((error) => {
                console.error("FAILED TO LOAD FULL IMAGE", error);
            });
    }

    const traitIconList = (field, Icon, title, alt) => {
        if (!plant || !plant[field] || !Array.isArray(plant[field]) ||
            plant[field].length === 0) return null;
        if (!alt) alt = title;
        let field_map = plant[field].map((f) => f.value)
        return (
            <div className="trait-container">
                <Icon className="trait-icon" width="25px" height="25px" title={title} alt={alt} />
                <p>: {field_map.join(', ')}</p>
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
                <img src={src} alt="TODO" className="full-image" />
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
                        {traitIconList("zones", null, "Zones")}
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
