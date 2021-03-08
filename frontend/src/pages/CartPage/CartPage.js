import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router';
import { StyledCartPage } from './CartPage.styled';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { getTheme, getCart, getSession } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import { updateCart, submitOrder } from 'query/http_promises';
import Cart from 'components/Cart/Cart';

function CartPage() {
    const [theme, setTheme] = useState(getTheme());
    const [cart, setCart] = useState(getCart());
    // Holds cart changes before update is final
    const [changedCart, setChangedCart] = useState(cart);
    const [session, setSession] = useState(getSession());
    let history = useHistory();

    const cartUpdate = (data) => {
        setChangedCart(data);
    }

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

    const updateOrder = () => {
        if (!session?.tag || !session?.token) {
            alert('Error: Could not update order!');
            return;
        }
        updateCart(session, session.tag, changedCart)
            .then(() => {
                alert('Order updated')
            })
            .catch(err => {
                console.error(err, changedCart);
                alert('Error: Could not update order!');
                return;
            })
    }

    const finalizeOrder = useCallback(() => {
        if (cart.items.length <= 0) {
            alert('Cannot finalize order: cart is empty');
            return;
        }
        if (!window.confirm('This will submit the order to New Life Nursery. We will contact you for further information. Are you sure you want to continue?')) return;
        submitOrder(session, changedCart)
            .then(() => {
                alert('Order submitted! We will be in touch with you soon :)')
            })
            .catch(err => {
                console.error(err);
                alert('Failed to submit order. Please contact New Life Nursery');
            })
    }, [cart, changedCart, session]);

    return (
        <StyledCartPage className="page" theme={theme}>
            <h2>Cart</h2>
            <Cart cart={cart} onUpdate={cartUpdate} />
            <Button onClick={() => history.push(LINKS.Shopping)}>Continue Shopping</Button>
            <Button onClick={updateOrder}>Update Order</Button>
            <Button onClick={finalizeOrder}>Request Quote</Button>
        </StyledCartPage>
    );
}

CartPage.propTypes = {

}

export default CartPage;
