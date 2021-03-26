import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { getCart, getSession } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import { Button } from '@material-ui/core';
import { updateCart, submitOrder } from 'query/http_promises';
import Cart from 'components/Cart/Cart';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import UpdateIcon from '@material-ui/icons/Update';
import { Typography, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 'max(12vh, 50px)',
        padding: 10,
    },
    header: {
        textAlign: 'center',
    },
    optionsContainer: {
        width: 'fit-content',
        justifyContent: 'center',
    },
    options: {
        margin: 2,
    },
}));

function CartPage() {
    let history = useHistory();
    const classes = useStyles();
    const [cart, setCart] = useState(getCart());
    // Holds cart changes before update is final
    const [changedCart, setChangedCart] = useState(cart);
    const [session, setSession] = useState(getSession());

    const cartUpdate = (data) => {
        setChangedCart(data);
    }

    useEffect(() => {
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => setCart(o));
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
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
        <div className={classes.root}>
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Cart</Typography>
            </div>
            <Cart cart={cart} onUpdate={cartUpdate} />
            <Container className={classes.optionsContainer}>
                <Button className={classes.options} startIcon={<ArrowBackIcon />} onClick={() => history.push(LINKS.Shopping)}>Continue Shopping</Button>
                <Button className={classes.options} startIcon={<UpdateIcon />} onClick={updateOrder}>Update Order</Button>
                <Button className={classes.options} endIcon={<ArrowForwardIcon />} onClick={finalizeOrder}>Request Quote</Button>
            </Container>
        </div>
    );
}

CartPage.propTypes = {

}

export default CartPage;
