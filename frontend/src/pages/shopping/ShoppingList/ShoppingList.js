import { useState, useLayoutEffect, useEffect, useCallback, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { useGet, useMutate } from "restful-react";
import { getInventory, getInventoryPage } from "query/http_promises";
import PubSub from 'utils/pubsub';
import { LINKS, PUBS, SORT_OPTIONS } from "utils/consts";
import {
    PlantCard,
    PlantDialog
} from 'components';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
}));

function ShoppingList({
    session,
    cart,
    page_size,
    sort = SORT_OPTIONS[0].value,
    filters,
    hideOutOfStock,
    searchString = '',
}) {
    page_size = page_size ?? Math.ceil(window.innerHeight / 150) * Math.ceil(window.innerWidth / 150);
    const classes = useStyles();
    // Plant data for every loaded plant
    const [loaded_plants, setLoadedPlants] = useState([]);
    const all_plant_ids = useRef([]);
    // Plant data for all visible plants (i.e. not filtered)
    const [plants, setPlants] = useState([]);
    // Thumbnail data for every plant
    const [thumbnails, setThumbnails] = useState([]);
    // Full image data for every sku group
    const [full_images, setFullImages] = useState([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams();
    // Find the current SKU group index, by any of the group's SKUs
    let curr_index = plants?.findIndex(c => c.skus.findIndex(s => s.sku === urlParams.sku) >= 0) ?? -1
    const loading = useRef(false);

    const { mutate: updateCart } = useMutate({
        verb: 'PUT',
        path: 'cart',
    });

    useGet({
        path: "images",
        queryParams: { ids: plants?.map(p => p.display_id), size: 'm' },
        resolve: (response) => {
            if (response.ok) {
                setThumbnails(response.images);
            }
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    useEffect(() => {
        if (!session) return;
        let mounted = true;
        getInventory(sort, page_size, false)
            .then((response) => {
                if (!mounted) return;
                setLoadedPlants(response.page_results);
                all_plant_ids.current = response.plant_ids;
                console.log('ALL PLANT IDS IS', all_plant_ids.current)
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });

        return () => mounted = false;
    }, [sort]);

    // Determine which skus will be visible to the user (i.e. not filtered out)
    useEffect(() => {
        //First, determine if plants without availability shall be shown
        let visible_plants = loaded_plants;
        if (hideOutOfStock) {
            visible_plants = loaded_plants?.filter(plant => {
                if (plant.skus.length === 0) return true;
                return plant.skus.filter(sku => sku.status === 1 && sku.availability > 0).length > 0;
            })
        }
        //Now, filter out everything that doesn't match the search string
        if (searchString.length > 0) {
            let search = searchString.trim().toLowerCase();
            visible_plants = visible_plants?.filter(plant => plant.latin_name?.toLowerCase().includes(search) || plant.common_name?.toLowerCase().includes(search));
        }
        //Find all applied filters
        let applied_filters = [];
        for (const key in filters) {
            let filter_group = filters[key];
            for (let i = 0; i < filter_group.length; i++) {
                if (filter_group[i].checked) {
                    applied_filters.push([key, filter_group[i].label]);
                }
            }
        }
        //If no filters are set, show all plants
        if (applied_filters.length == 0) {
            setPlants(visible_plants);
            return;
        }
        //Select all plants that contain the filters
        let filtered_plants = [];
        for (let i = 0; i < visible_plants?.length ?? 0; i++) {
            let curr_plant = visible_plants[i];
            filterloop:
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
                        break filterloop;
                    }
                } else if (data?.value === value) {
                    filtered_plants.push(curr_plant);
                    break filterloop;
                }
            }
        }
        setPlants(filtered_plants);
    }, [loaded_plants, filters, searchString, hideOutOfStock])

    const loadNextPage = useCallback(() => {
        if (loading.current || loaded_plants.length >= all_plant_ids.current.length) return;
        loading.current = true;
        //Grab all card thumbnail images
        let load_to = Math.min(all_plant_ids.current.length, loaded_plants.length + page_size - 1);
        let clone = all_plant_ids.current.slice();
        let page_ids = clone.splice(loaded_plants.length, load_to);
        if (page_ids.length == 0) {
            loading.current = false;
            return;
        }
        getInventoryPage(page_ids).then(response => {
            setLoadedPlants(c => c.concat(...response.data));
        }).catch(error => {
            console.error("Failed to load SKUs!", error);
        }).finally(() => {
            loading.current = false;
        })
        return () => loading.current = false;
    }, [loaded_plants, all_plant_ids, page_size]);

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

    const toCart = () => {
        history.push(LINKS.Cart);
    }

    const setInCart = (name, sku, operation, quantity) => {
        if (!session?.tag || !session?.token) return;
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        let cart_copy = JSON.parse(JSON.stringify(cart));
        cart_copy.items.push({ 'sku': sku.sku, 'quantity': quantity });
        updateCart(session?.tag, cart_copy)
            .then(() => {
                if (operation === 'ADD') {
                    PubSub.publish(PUBS.Snack, { 
                        message: `${quantity} ${name}(s) added to cart.`, 
                        buttonText: 'View Cart',
                        buttonClicked: toCart,
                    });
                }
                else if (operation === 'SET') {
                    PubSub.publish(PUBS.Snack, { 
                        message: `${name} quantity updated to ${quantity}.`, 
                        buttonText: 'View Cart',
                        buttonClicked: toCart,
                    });
                }
                else if (operation === 'DELETE') {
                    PubSub.publish(PUBS.Snack, { 
                        message: `${name} 'removed from' cart.`, 
                        buttonText: 'View Cart',
                        buttonClicked: toCart,
                    });
                }
            })
            .catch(err => {
                console.error(err, cart_copy);
                PubSub.publish(PUBS.Snack, {message: 'Failed to add to cart.', severity: 'error'});
            })
    }

    return (
        <div className={classes.root} id={track_scrolling_id}>
            {(curr_index >= 0) ? <PlantDialog
                plant={curr_index >= 0 ? plants[curr_index] : null}
                onCart={setInCart}
                open={curr_index >= 0}
                onClose={() => history.goBack()} /> : null}
            
            {plants?.map((item, index) =>
                <PlantCard key={index}
                    cart={cart}
                    onClick={() => expandSku(item.skus[0].sku)}
                    plant={item}
                    thumbnail={thumbnails?.length >= index ? thumbnails[index] : null}
                    onSetInCart={setInCart} />)}
        </div>
    );
}

ShoppingList.propTypes = {
    session: PropTypes.object,
    cart: PropTypes.object,
    page_size: PropTypes.number,
    sort: PropTypes.string,
    filters: PropTypes.object,
    searchString: PropTypes.string,
};

export default ShoppingList;