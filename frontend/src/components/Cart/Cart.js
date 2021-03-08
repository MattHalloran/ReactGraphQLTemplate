import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledCart } from './Cart.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme } from 'utils/storage';
import { getImages } from 'query/http_promises';
import { PubSub } from 'utils/pubsub';
import { XIcon } from 'assets/img';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
import { displayPrice } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import DropDown from 'components/inputs/DropDown/DropDown';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Button from 'components/Button/Button';
import { deleteArrayIndex } from 'utils/arrayTools';
import { updateObject } from 'utils/objectTools';

const DELIVERY_OPTIONS = [
    {
        label: 'Pickup',
        value: 0,
    },
    {
        label: 'Delivery',
        value: 1,
    },
]

function Cart({
    cart,
    onUpdate,
}) {
    const [changedCart, setChangedCart] = useState(cart ?? {});
    const [theme, setTheme] = useState(getTheme());
    // Thumbnail data for every SKU
    const [thumbnails, setThumbnails] = useState([]);

    if(!changedCart.desired_delivery_date) {
        changedCart.desired_delivery_date = +(new Date());
    }
    if(changedCart.special_instructions === null) {
        changedCart.special_instructions = '';
    }

    useEffect(() => {
        onUpdate(changedCart);
    }, [changedCart])

    useEffect(() => {
        let ids = cart.items.map(it => it.sku.plant.id);
        getImages(ids, 'm').then(response => {
            setThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });

        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

    const setNotes = useCallback((notes) => {
        setChangedCart(c => updateObject(c, 'special_instructions', notes));
    }, [changedCart])

    const setDeliveryDate = useCallback((date) => {
        setChangedCart(c => updateObject(c, 'desired_delivery_date', +date));
    }, [changedCart])

    const handleDeliveryChange = useCallback((sort_item, _) => {
        if (changedCart?.is_delivery === sort_item.value) return;
        setChangedCart(c => updateObject(c, 'is_delivery', sort_item.value));
    }, [changedCart])

    const updateItemQuantity = useCallback((sku, quantity) => {
        let index = changedCart?.items?.findIndex(i => i.sku.sku === sku) ?? -1;
        if (index < 0 || index >= (changedCart?.items.length ?? -1)) {
            alert('Error: Could not update item quantity!');
            console.log(index);
            return;
        }
        let cart_copy = {...changedCart};
        cart_copy.items[index].quantity = quantity;
        setChangedCart(cart_copy);
    }, [changedCart])

    useEffect(() => {
        console.log('THUMBNAILS UPDATED', thumbnails);
    }, [thumbnails])

    useEffect(() => {
        console.log('CART UPDATED', changedCart);
    }, [changedCart])

    const deleteCartItem = useCallback((sku) => {
        let index = changedCart?.items?.findIndex(i => i.sku.sku === sku.sku) ?? -1;
        if (index < 0) {
            alert(`Error: could not remove item for ${sku.sku}`);
            return;
        }
        setThumbnails(deleteArrayIndex(thumbnails, index));
        let changed_item_list = deleteArrayIndex(changedCart.items, index);
        setChangedCart(updateObject(changedCart, 'items', changed_item_list));
    }, [thumbnails, changedCart])

    let all_total = 0;
    const cart_item_to_row = useCallback((data, key) => {
        let index = changedCart?.items?.findIndex(i => i.sku.sku === data.sku.sku) ?? -1;
        let thumbnail;
        if (index >= 0)
            thumbnail = thumbnails.length >= index ? thumbnails[index] : null
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let display_price;
        let display_total;
        let display_image;
        if (isNaN(price)) {
            display_price = 'TBD';
            display_total = 'TBD';
            all_total = 'TBD';
        } else {
            display_price = displayPrice(price);
            display_total = displayPrice(quantity * price);
            if (typeof (all_total) === 'number') all_total += (quantity * price);
        }
        if (thumbnail) {
            display_image = <img src={`data:image/jpeg;base64,${thumbnail}`} className="cart-image" alt="TODO" />
        } else {
            display_image = <NoImageIcon className="cart-image" />
        }

        return (
            <tr key={key}>
                <td><div className="product-row">
                    <XIcon width="30px" height="30px" onClick={() => deleteCartItem(data.sku)} />
                    {display_image}
                    <p>{data.sku?.plant?.latin_name}</p>
                </div></td>
                <td>{display_price}</td>
                <td><QuantityBox
                    className="quant"
                    min_value={0}
                    max_value={data.sku?.quantity ?? 100}
                    initial_value={quantity}
                    valueFunc={(q) => updateItemQuantity(data.sku.sku, q)} /></td>
                <td>{display_total}</td>
            </tr>
        );
    }, [thumbnails, changedCart])

    return (
        <StyledCart theme={theme}>
            <table className="cart-table">
                <thead>
                    <tr>
                        <th style={{ width: '50%' }}>Product</th>
                        <th style={{ width: '10%' }}>Price</th>
                        <th style={{ width: '20%' }}>Quantity</th>
                        <th style={{ width: '20%' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {changedCart?.items?.map((c, index) => cart_item_to_row(c, index))}
                </tbody>
            </table>
            <p>Total: {displayPrice(all_total)}</p>
            <div className="extra-stuff">
                <div className="third">
                    <DropDown options={DELIVERY_OPTIONS} onChange={handleDeliveryChange} initial_value={DELIVERY_OPTIONS.find(o => o.value == changedCart?.is_delivery)} />
                </div>
                <div className="third">
                    <DatePicker
                        selected={new Date(changedCart.desired_delivery_date)}
                        onChange={date => setDeliveryDate(date)}
                        customInput={<Button visible={changedCart?.is_delivery} />}
                        filterDate={d => d > Date.now()} />
                </div>
                <div className="third">
                    <textarea
                        value={changedCart.special_instructions}
                        onChange={e => setNotes(e.target.value)}
                        rows="5" />
                </div>
            </div>
        </StyledCart>
    );
}

Cart.propTypes = {
    cart: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export default Cart;
