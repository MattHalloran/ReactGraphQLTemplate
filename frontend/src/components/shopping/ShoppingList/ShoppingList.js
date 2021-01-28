import React, { useState, useLayoutEffect, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledSkuCard, StyledExpandedSku } from "./ShoppingList.styled";
import { getImageFromHash, getImageFromSku, getInventory, getInventoryPage } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { BUSINESS_NAME, LINKS, PUBS } from "consts";
import Modal from "components/shared/wrappers/Modal/Modal";
import IconButton from "@material-ui/core/IconButton";
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PollinatorIcon from 'assets/img/bee.svg';
import RegionIcon from 'assets/img/map.svg';
import SaltIcon from 'assets/img/salt.svg';
import SunIcon from 'assets/img/sun.svg';
import ColorIcon from 'assets/img/color-circle.svg';
import CalendarIcon from 'assets/img/calendar.svg';
import MoistureIcon from 'assets/img/moisture-wicking-fabric.svg';

function ShoppingList(props) {
  let history = useHistory();
  const [popup, setPopup] = useState(null);
  const [cards, setCards] = useState([]);
  const [all_skus, setAllSkus] = useState([]);
  // [sku, base64 data, alt]
  const [curr_sku, setCurrSku] = useState(null);
  let default_filter = props.default_filter ? props.default_filter : "A-Z";
  const [filter_by, setFilterBy] = useState(default_filter);
  const track_scrolling_id = 'scroll-tracked';
  const full_images = useRef({});
  const urlParams = useParams();
  const curr_index = useMemo(() => cards.current?.findIndex(c => c.sku === urlParams.sku) ?? -1, [cards, urlParams]);
  const loading = useRef(false);
  const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

  // useHotkeys('Escape', () => setCurrSku([null, null, null]));
  // useHotkeys('arrowLeft', () => prevImage());
  // useHotkeys('arrowRight', () => nextImage());

  const loading_full_image = useRef(false);
  const loadImage = useCallback((index, sku) => {
    // If this function hasn't finished yet
    if (loading_full_image.current) return;
    // If there is an image to load
    if (!sku) return;
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
      setCurrSku([null, null, null]);
      PubSub.publish(PUBS.PopupOpen, false);
    }
  }, [urlParams, curr_index, loadImage])

  useEffect(() => {
    let mounted = true;
    getInventory(filter_by)
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
  }, [filter_by]);

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
        <ExpandedSku data={popup_data} goLeft={() => { }} goRight={() => { }} />
      </Modal>
    );
  }, [all_skus, curr_sku])

  return (
    <StyledShoppingList id={track_scrolling_id}>
      {popup}
      {cards.map((item, index) => <SkuCard key={index} onClick={expandSku} data={item} goLeft={prevImage} goRight={nextImage} />)}
    </StyledShoppingList>
  );
}

ShoppingList.propTypes = {
  page_size: PropTypes.number,
  default_filter: PropTypes.string,
};

export default ShoppingList;

function SkuCard(props) {
  //console.log('IN SKU CARDDDD', props.data);
  const sku = props.data;
  const plant = sku.plant;

  const handleExpandClick = () => {
    props.onClick(sku.sku);
  };

  let sizes = sku.sizes?.map(size => (
    <div className="size">{size}</div>
  ));

  return (
    <StyledSkuCard>
      <h1 className="title">{plant.latin_name}</h1>
      <img src={`data:image/jpeg;base64,${sku.display_image}`} alt="TODO" />
      SOME TEXT
      { sizes}
      Availability: hfhdkjaf
      <IconButton aria-label="add to favorites">
        <AiOutlineHeart />
      </IconButton>
      <IconButton onClick={handleExpandClick} aria-label="show more">
        <BsArrowsFullscreen />
      </IconButton>
    </StyledSkuCard>
  );
}

SkuCard.propTypes = {
  data: PropTypes.object.isRequired,
  goLeft: PropTypes.func.isRequired,
  goRight: PropTypes.func.isRequired,
};

export { SkuCard };

function ExpandedSku(props) {
  console.log('EEEEEE', props)
  const plant = props?.data?.plant;
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

  const traitList = (field, text) => {
    if (!plant || !plant[field] || !Array.isArray(plant[field]) ||
      plant[field].length === 0) return null;
    let field_map = plant[field].map((f) => f.value)
    return (
      <div className="trait-container">
        <p>{text}: {field_map.join(', ')}</p>
      </div>
    )
  }

  const traitIconList = (field, src, title, alt) => {
    if (!plant || !plant[field] || !Array.isArray(plant[field]) ||
      plant[field].length === 0) return null;
    if (!alt) alt = title;
    let field_map = plant[field].map((f) => f.value)
    return (
      <div className="trait-container">
        <img src={src} className="trait-icon" title={title} alt={alt} />
        <p>: {field_map.join(', ')}</p>
      </div>
    )
  }

  return (
    <StyledExpandedSku>
      <FaChevronLeft className="arrow left" onClick={props.goLeft} />
      <FaChevronRight className="arrow right" onClick={props.goRight} />
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
          {traitIconList("physiographic_regions", RegionIcon, "Physiographic Region")}
          {traitIconList("attracts_pollinators_and_wildlifes", PollinatorIcon, "Attracted Pollinators and Wildlife")}
          {traitIconList("drought_tolerance", null, "Drought Tolerance")}
          {traitIconList("salt_tolerance", SaltIcon, "Salt Tolerance")}
          </div>
          <div className="bloom">
            <p>Bloom</p>
            {traitIconList("bloom_colors", ColorIcon, "Bloom Colors")}
            {traitIconList("bloom_times", CalendarIcon, "Bloom Times")}
          </div>
          <div className="light">
            <p>Light</p>
          {traitIconList("light_ranges", null, "Light Range")}
          {traitIconList("optimal_light", SunIcon, "Optimal Light")}
          </div>
          <div className="soil">
            <p>Soil</p>
          {traitIconList("soil_moistures", MoistureIcon, "Soil Moisture")}
          {traitIconList("soil_phs", null, "Soil PH")}
          {traitIconList("soil_types", null, "Soil Type")}
          </div>
        </div>
      </div>
    </StyledExpandedSku>
  );
}

ExpandedSku.propTypes = {};

export { ExpandedSku };
