import React from 'react';
import PropTypes from 'prop-types';
import { StyledShoppingList } from './ShoppingList.styled';
import ItemCard from '../ItemCard';
import PubSub from '../../utils/pubsub';
import * as shoppingQuery from '../../query/shopping';

class ShoppingList extends React.Component {
    constructor(props) {
        super(props);
        this.page_size = props.page_size ? props.page_size : 25;
        this.default_filter = props.default_filter ? props.default_filter : "A-Z";
        this.state = {
            displayed_items: [],
            item_ids: [],
            filter_by: this.default_filter, //A-Z, Z-A, Best-Seller, Low to High, High to Low
        }
        this.queryItems();
    }

    queryItems() {
        PubSub.publish('loading', true);
        shoppingQuery.getInventory(this.state.filter_by).then(response => {
            PubSub.publish('loading', false);
          this.setState({ displayed_items: response.page_items,
                          item_ids: response.item_ids });
        }).catch(error => {
            console.log("Failed to load inventory");
            console.error(error);
            PubSub.publishSync('loading', false);
            alert(error.error);
        })
    }

    loadNextPage() {
        shoppingQuery.getInventoryPage().then(response => {
          this.setState({ displayed_items: response.page_items,
                          item_ids: response.item_ids });
        }).catch(error => {
            console.log("Failed to load inventory page");
            console.error(error);
            alert(error.error);
        })
    }

    render() {
        let cardList = null;
        if (this.state.displayed_items instanceof Array) {
            this.state.displayed_items.forEach(item => {
                cardList.push(<ItemCard data={item} />);
            })
        }
        return (
            <StyledShoppingList>
                {cardList}
            </StyledShoppingList >
        );
    }
}

ShoppingList.propTypes = {
    page_size: PropTypes.number,
    default_filter: PropTypes.string
}

export default ShoppingList;