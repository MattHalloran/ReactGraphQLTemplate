import { useState, useLayoutEffect, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router';
import { StyledCartPage } from './CartPage.styled';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { getTheme, getCart, getSession } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import { XIcon } from 'assets/img';
import QuantityBox from 'components/inputs/QuantityBox/QuantityBox';
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

function CartPage() {
    const [theme, setTheme] = useState(getTheme());
    const [cart, setCart] = useState(getCart());
    //Stores quantities before cart update
    const quantities = useRef([]);
    const [session, setSession] = useState(getSession());
    const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0].value);
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [notes, setNotes] = useHistoryState('cart_note_area','');
    let history = useHistory();
    console.log('ON CART PAGEEE', cart);

    useEffect(() => {
        if (!cart?.items) {
            quantities.current = [];
            return;
        }
        let starting_quantities = [];
        cart.items.forEach(i => starting_quantities.push(i.quantity));
        quantities.current = starting_quantities;
    }, [cart])

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(cartSub);
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME}`;
    })

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
    }, [cart, delivery, deliveryDate, notes, session]);

    let all_total = 0;
    const cart_item_to_row = (data) => {
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
            if (typeof(all_total) === 'number') all_total += (quantity * price);
        }
        if (data.sku.display_image) {
            display_image = <img src={`data:image/jpeg;base64,${data.sku.display_image}`} className="cart-image" alt="TODO" />
        } else {
            display_image = <NoImageIcon className="cart-image" />
        }

        return (
            <tr>
                <td><div className="product-row">
                    <XIcon width="30px" height="30px" onClick={() => deleteCartItem(data.sku)}/>
                    { display_image }
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
        </StyledCartPage>
    );
}

CartPage.propTypes = {

}

export default CartPage;
