import React, { useState, useLayoutEffect, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { StyledShoppingList, StyledExpandedSku } from "./ShoppingList.styled";
import PubSub from "utils/pubsub";
import * as shoppingQuery from "query/shopping";
import { BUSINESS_NAME, PUBS, LINKS } from "consts";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "components/shared/wrappers/Modal/Modal";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function ShoppingList(props) {
  let history = useHistory();
  const urlParams = useParams();
  const curr_sku = urlParams.sku;
  let page_size = props.page_size ? props.page_size : 25;
  let default_filter = props.default_filter ? props.default_filter : "A-Z";
  let [card_list, setCardList] = useState([]);
  let [card_list_data, setCardListData] = useState([]);
  let [item_ids, setItemIDs] = useState([]);
  let [filter_by, setFilterBy] = useState(default_filter);

  useLayoutEffect(() => {
    queryItems();
  }, []);

  useLayoutEffect(() => {
    document.title = `Gallery | ${BUSINESS_NAME}`;
  });

  const queryItems = () => {
    PubSub.publish(PUBS.Loading, true);
    shoppingQuery
      .getInventory(filter_by)
      .then((response) => {
        PubSub.publish(PUBS.Loading, false);
        console.log("SEND ME BOOTY PIC GURL", response);
        let list_data = response.page_results;
        setCardListData(list_data);
        setCardList(
          list_data.map((item) => <SkuCard onClick={expandSku} data={item} />)
        );
        setItemIDs(response.all_sku_ids);
      })
      .catch((error) => {
        console.log("Failed to load inventory");
        console.error(error);
        PubSub.publishSync(PUBS.Loading, false);
        alert(error.error);
      });
  };

  //   const loadNextPage = () => {
  //     shoppingQuery
  //       .getInventoryPage(page_size)
  //       .then((response) => {
  //         setDisplayedItems(response.page_items);
  //         setItemIDs(response.item_ids);
  //       })
  //       .catch((error) => {
  //         console.log("Failed to load inventory page");
  //         console.error(error);
  //         alert(error.error);
  //       });
  //   };

  const expandSku = (sku) => {
    history.push(LINKS.Shopping + "/" + sku);
  };

  let popup;
  let popup_data;
  if (curr_sku) {
    let index = card_list_data.map((e) => e.sku).indexOf(curr_sku);
    popup_data = card_list_data[index];
    popup = (
      <Modal>
        <ExpandedSku data={popup_data} goLeft={() => { }} goRight={() => { }} />
      </Modal>
    );
  }
  return (
    <StyledShoppingList>
      {popup}
      {card_list.length > 0 ? card_list : null}
    </StyledShoppingList>
  );
}

ShoppingList.propTypes = {
  page_size: PropTypes.number,
  default_filter: PropTypes.string,
};

export default ShoppingList;

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

function SkuCard(props) {
  const latin_name = props.data.plant.latin_name;
  const common_name = props.data.plant.common_name;
  const plant = props.data.plant;
  const classes = useStyles();

  const handleExpandClick = () => {
    props.onClick(props.data.sku);
  };
  return (
    <Card className={classes.root} onClick={handleExpandClick}>
      <CardHeader title={latin_name} subheader={common_name} />
      <CardMedia
        className={classes.media}
        image="/static/images/cards/paella.jpg"
        title="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the
          mussels, if you like.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <AiOutlineHeart />
        </IconButton>
        <IconButton onClick={handleExpandClick} aria-label="show more">
          <BsArrowsFullscreen />
        </IconButton>
      </CardActions>
    </Card>
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
  const [src, setSrc] = useState(0);

  if (plant) {
    shoppingQuery.getShoppingImage(plant.flower_images[0].hash)
    .then((response) => {
      setSrc(`data:image/jpeg;base64,${response.image}`);
    })
    .catch((error) => {
      console.error("FAILED TO LOAD FULL IMAGE", error);
    });
  }

  return (
    <StyledExpandedSku>
      <FaChevronLeft className="arrow left" onClick={props.goLeft} />
      <FaChevronRight className="arrow right" onClick={props.goRight} />
      <div className="main-content">
        <div>
          <h1>{props.latin_name}</h1>
        </div>
        <div>
          <img src={src} alt="TODO" className="full-image" />
        </div>
        <div>
          <p>TODO</p>
        </div>
      </div>
    </StyledExpandedSku>
  );
}

ExpandedSku.propTypes = {};

export { ExpandedSku };
