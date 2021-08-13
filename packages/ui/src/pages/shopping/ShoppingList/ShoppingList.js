import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { skusQuery } from 'graphql/query';
import { updateOrderMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import { getPlantTrait, LINKS, PUBS, PubSub, SORT_OPTIONS } from "utils";
import {
    PlantCard,
    PlantDialog
} from 'components';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
}));

function ShoppingList({
    session,
    onSessionUpdate,
    cart,
    sort = SORT_OPTIONS[0].value,
    filters,
    hideOutOfStock,
    searchString = '',
}) {
    const classes = useStyles();
    // Plant data for all visible plants (i.e. not filtered)
    const [plants, setPlants] = useState([]);
    // Full image data for every sku group
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    // Find the current SKU group index, by any of the group's SKUs
    let curr_index = plants?.findIndex(c => c.skus.findIndex(s => s.sku === urlParams.sku) >= 0) ?? -1
    const { data: skuData } = useQuery(skusQuery,  { variables: { sortBy: sort } });
    const [updateOrder] = useMutation(updateOrderMutation);

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    // Determine which skus will be visible to the customer (i.e. not filtered out)
    useEffect(() => {
        //First, determine if plants without availability shall be shown
        let visible_plants = skuData?.skus;
        if (hideOutOfStock) {
            visible_plants = visible_plants?.filter(plant => {
                if (plant.skus.length === 0) return true;
                return plant.skus.filter(sku => sku.status === 1 && sku.availability > 0).length > 0;
            })
        }
        //Now, filter out everything that doesn't match the search string
        if (searchString.length > 0) {
            let search = searchString.trim().toLowerCase();
            visible_plants = visible_plants?.filter(plant => plant.latin_name?.toLowerCase().includes(search) || getPlantTrait('commonName', plant)?.toLowerCase().includes(search));
        }
        //Find all applied filters
        let applied_filters = [];
        if (filters && filters[Symbol.iterator] === 'function') {
            for (const key of filters) {
                let filter_group = filters[key];
                for (let i = 0; i < filter_group.length; i++) {
                    if (filter_group[i].checked) {
                        applied_filters.push([key, filter_group[i].label]);
                    }
                }
            }
        }
        //If no filters are set, show all plants
        if (applied_filters.length === 0) {
            setPlants(visible_plants);
            return;
        }
        //Select all plants that contain the filters
        let filtered_plants = [];
        for (let i = 0; i < visible_plants?.length ?? 0; i++) {
            let curr_plant = visible_plants[i];
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
                        break;
                    }
                } else if (data?.value === value) {
                    filtered_plants.push(curr_plant);
                    break;
                }
            }
        }
        setPlants(filtered_plants);
    }, [skuData, filters, searchString, hideOutOfStock])

    const expandSku = (sku) => {
        history.push(LINKS.Shopping + "/" + sku);
    };

    const toCart = () => {
        history.push(LINKS.Cart);
    }

    const addToCart = (name, sku, quantity) => {
        if (!session?.customer_id || !session?.token) return;
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        let cart_copy = JSON.parse(JSON.stringify(cart));
        cart_copy.items.push({ 'sku': sku.sku, 'quantity': quantity });

        PubSub.publish(PUBS.Loading, true);
        updateOrder({ variables: { input: { id: session?.customer_id, ...cart_copy } } }).then((response) => {
            const data = response.data.updateOrder;
            PubSub.publish(PUBS.Loading, false);
            if (data !== null) {
                onSessionUpdate({...session, cart: data });
                PubSub.publish(PUBS.Snack, { 
                    message: `${quantity} ${name}(s) added to cart.`, 
                    buttonText: 'View Cart',
                    buttonClicked: toCart,
                });
            } else PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error' });
        }).catch((response) => {
            PubSub.publish(PUBS.Loading, false);
            PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
        })
    }

    return (
        <div className={classes.root} id={track_scrolling_id}>
            {(curr_index >= 0) ? <PlantDialog
                plant={curr_index >= 0 ? plants[curr_index] : null}
                onAddToCart={addToCart}
                open={curr_index >= 0}
                onClose={() => history.goBack()} /> : null}
            
            {plants?.map((item, index) =>
                <PlantCard key={index}
                    onClick={() => expandSku(item.skus[0].sku)}
                    plant={item} />)}
        </div>
    );
}

ShoppingList.propTypes = {
    session: PropTypes.object,
    onSessionUpdate: PropTypes.func.isRequired,
    cart: PropTypes.object,
    sort: PropTypes.string,
    filters: PropTypes.object,
    searchString: PropTypes.string,
};

export { ShoppingList };