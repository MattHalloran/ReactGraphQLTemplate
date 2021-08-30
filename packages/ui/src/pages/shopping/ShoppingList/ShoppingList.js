import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { plantsQuery } from 'graphql/query';
import { addOrderItemMutation } from 'graphql/mutation';
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
    sortBy = SORT_OPTIONS[0].value,
    filters,
    hideOutOfStock,
    searchString = '',
}) {
    const classes = useStyles();
    // Plant data for all visible plants (i.e. not filtered)
    const [plants, setPlants] = useState([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    // Find current plant and current sku
    const currPlant = Array.isArray(plants) ? plants.find(p => p.skus.some(s => s.sku === urlParams.sku)) : null;
    const currSku = currPlant?.skus ? currPlant.skus.find(s => s.sku === urlParams.sku) : null;
    const { data: plantData } = useQuery(plantsQuery,  { variables: { sortBy, searchString, active: true, hideOutOfStock } });
    const [addOrderItem] = useMutation(addOrderItemMutation);

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    // Determine which skus will be visible to the customer (i.e. not filtered out)
    useEffect(() => {
        if (!filters || Object.values(filters).length === 0) {
            setPlants(plantData?.plants);
            return;
        }
        console.log('FILTERSSS', filters)
        let filtered_plants = [];
        for (const plant of plantData?.plants) {
            let found = false;
            for (const [key, value] of Object.entries(filters)) {
                if (found) break;
                const traitValue = getPlantTrait(key, plant);
                if (traitValue && traitValue.toLowerCase() === (value+'').toLowerCase()) {
                    found = true;
                    break;
                }
                if (!Array.isArray(plant.skus)) continue;
                for (let i = 0; i < plant.skus.length; i++) {
                    const skuValue = plant.skus[i][key];
                    if (skuValue && skuValue.toLowerCase() === (value+'').toLowerCase()) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) filtered_plants.push(plant);
        }
        setPlants(filtered_plants);
    }, [plantData, filters, searchString, hideOutOfStock])

    const expandSku = (sku) => {
        history.push(LINKS.Shopping + "/" + sku);
    };

    const toCart = () => {
        history.push(LINKS.Cart);
    }

    const addToCart = (name, sku, quantity) => {
        console.log('ADD TO CARTTTTTT', quantity)
        if (!session?.id) return;
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        PubSub.publish(PUBS.Loading, true);
        addOrderItem({ variables: { quantity, orderId: cart?.id, skuId: sku.id } }).then((response) => {
            const data = response.data.addOrderItem;
            PubSub.publish(PUBS.Loading, false);
            if (data !== null) {
                onSessionUpdate();
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
            {(currPlant) ? <PlantDialog
                onSessionUpdate
                plant={currPlant}
                selectedSku={currSku}
                onAddToCart={addToCart}
                open={currPlant !== null}
                onClose={() => history.goBack()} /> : null}
            
            {plants?.map((item, index) =>
                <PlantCard key={index}
                    onClick={(data) => expandSku(data.selectedSku.sku)}
                    plant={item} />)}
        </div>
    );
}

ShoppingList.propTypes = {
    session: PropTypes.object,
    onSessionUpdate: PropTypes.func.isRequired,
    cart: PropTypes.object,
    sortBy: PropTypes.string,
    filters: PropTypes.object,
    searchString: PropTypes.string,
};

export { ShoppingList };