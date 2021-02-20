import { useState, useLayoutEffect, useEffect } from 'react';
import { StyledCartPage } from './CartPage.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme, getCart } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import { XIcon } from 'assets/img';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
<<<<<<< Updated upstream
=======
import { setSkuInCart, submitOrder } from 'query/http_promises';
import { displayPrice } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import DropDown from 'components/inputs/DropDown/DropDown';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useHistoryState } from 'utils/useHistoryState';

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
>>>>>>> Stashed changes

function CartPage() {
    const [theme, setTheme] = useState(getTheme());
    const [cart, setCart] = useState(getCart());
<<<<<<< Updated upstream
=======
    //Stores quantities before cart update
    const quantities = useRef([]);
    const [session, setSession] = useState(getSession());
    const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0].value);
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [notes, setNotes] = useHistoryState('cart_note_area','');
    let history = useHistory();
>>>>>>> Stashed changes
    console.log('ON CART PAGEEE', cart);

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(cartSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

<<<<<<< Updated upstream
=======
    const handleDeliveryChange = (sort_item, _) => {
        setDelivery(sort_item.value);
    }

    const updateItemQuantity = (sku, quantity) => {
        let index = cart?.items?.findIndex(i => i.sku.sku === sku) ?? -1;
        if (index < 0 || index >= quantities.current.length) {
            alert('Error: Could not update item quantity!');
            console.log(index);
            return;
        }
        quantities.current[index] = quantity;
    }

    const updateOrder = () => {
        if (!session?.email || !session?.token) {
            alert('Error: Could not update order!');
            return;
        }
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].quantity === quantities.current[i]) continue;
            setSkuInCart(session, cart.items[i].sku.sku, 'SET', quantities.current[i])
                .then(() => {})
                .catch(err => {
                    console.error(err);
                    alert('Error: Could not update order!');
                    return;
                })
        }
        alert('Order updated')
    }

    const deleteCartItem = (sku) => {
        if (!session?.email || !session?.token) return;
        let display_name = sku?.plant?.latin_name ?? sku?.plant?.common_name ?? 'plant';
        setSkuInCart(session, sku.sku, 'DELETE', 0)
            .then(() => {
                alert(`${display_name} 'removed from' cart!`)
            })
            .catch(err => {
                console.error(err);
                alert(`Error: Failed to delete item! ${err.status}`);
            })
    }

    const finalizeOrder = useCallback(() => {
        if (cart.items.length <= 0) {
            alert('Cannot finalize order: cart is empty');
            return;
        }
        if (!window.confirm('This will submit the order to New Life Nursery. We will contact you for further information. Are you sure you want to continue?')) return;
        submitOrder(session, delivery, deliveryDate.getTime(), notes)
            .then(() => {
                alert('Order submitted! We will be in touch with you soon :)')
            })
            .catch(err => {
                console.error(err);
                alert('Failed to submit order. Please contact New Life Nursery');
            })
    }, [cart]);

>>>>>>> Stashed changes
    let all_total = 0;
    const cart_item_to_row = (data) => {
        let quantity = data.quantity;
        let price = parseInt(data.sku.price);
        let display_price;
        let display_total;
        if (isNaN(price)) {
            display_price = 'TBD';
            display_total = 'TBD';
            all_total = 'TBD';
        } else {
            display_price = `$${price}`;
            display_total = `$${quantity * price}`;
            if (typeof(all_total) === 'number') all_total += (quantity * price);
        }
        return (
            <tr>
                <td><div className="product-row">
                    <XIcon width="30px" height="30px" /> 
                    <img className="cart-image" src={`data:image/jpeg;base64,${data.sku.display_image}`} />
                    <p>{data.sku?.plant?.latin_name}</p>
                    </div></td>
                <td>{display_price}</td>
                <td><QuantityBox
                            className="quant"
                            min_value={0}
                            max_value={data.sku?.quantity ?? 100}
                            initial_value={1}
                            value={quantity}
                            valueFunc={() => console.log('TODOOOOOOOO')} /></td>
                <td>{display_total}</td>
            </tr>
        );
    }

    return (
        <StyledCartPage className="page" theme={theme}>
            <h1>Cart</h1>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th style={{width: '50%'}}>Product</th>
                        <th style={{width: '10%'}}>Price</th>
                        <th style={{width: '20%'}}>Quantity</th>
                        <th style={{width: '20%'}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart?.items?.map(c => cart_item_to_row(c))}
                </tbody>
            </table>
<<<<<<< Updated upstream
            <p>Total: {all_total}</p>
            <Button>Update Cart</Button>
            <Button>Finalize Order</Button>
=======
            <p>Total: {displayPrice(all_total)}</p>
            <div>
                <DropDown options={DELIVERY_OPTIONS} onChange={handleDeliveryChange} initial_value={DELIVERY_OPTIONS[0]} />
                <DatePicker
                    selected={deliveryDate}
                    onChange={date => setDeliveryDate(date)}
                    customInput={<Button visible={delivery} />}
                    filterDate={d => d > Date.now()}/>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows="5"/>
            </div>
            <Button onClick={() => history.push(LINKS.Shopping)}>Continue Shopping</Button>
            <Button onClick={updateOrder}>Update Order</Button>
            <Button onClick={finalizeOrder}>Request Quote</Button>
>>>>>>> Stashed changes
        </StyledCartPage>
    );
}

CartPage.propTypes = {
    
}

export default CartPage;