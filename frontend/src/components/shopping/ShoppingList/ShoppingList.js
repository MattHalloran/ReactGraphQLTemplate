import React, { useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledShoppingList } from './ShoppingList.styled';
import ItemCard from 'components/shared/ItemCard/ItemCard';
import PubSub from 'utils/pubsub';
import * as shoppingQuery from 'query/shopping';
import { PUBS } from 'consts';

function ShoppingList(props) {
    let page_size = props.page_size ? props.page_size : 25;
    let default_filter = props.default_filter ? props.default_filter : "A-Z";
    let [displayed_items, setDisplayedItems] = useState([]);
    let [item_ids, setItemIDs] = useState([]);
    let [filter_by, setFilterBy] = useState(default_filter);

    useLayoutEffect(() => {
        queryItems();
    }, [])

    const queryItems = () => {
        PubSub.publish(PUBS.Loading, true);
        shoppingQuery.getInventory(filter_by).then(response => {
            PubSub.publish(PUBS.Loading, false);
            setDisplayedItems(response.page_items);
            setItemIDs(response.item_ids);
        }).catch(error => {
            console.log("Failed to load inventory");
            console.error(error);
            PubSub.publishSync(PUBS.Loading, false);
            alert(error.error);
        })
    }

    const loadNextPage = () => {
        shoppingQuery.getInventoryPage(page_size).then(response => {
            setDisplayedItems(response.page_items);
            setItemIDs(response.item_ids);
        }).catch(error => {
            console.log("Failed to load inventory page");
            console.error(error);
            alert(error.error);
        })
    }

    let cardList = null;
    if (displayed_items instanceof Array) {
        displayed_items.forEach(item => {
            cardList.push(<ItemCard data={item} />);
        })
    }
    return (
        <StyledShoppingList>
            {cardList}
        </StyledShoppingList >
    );
}

ShoppingList.propTypes = {
    page_size: PropTypes.number,
    default_filter: PropTypes.string
}

export default ShoppingList;