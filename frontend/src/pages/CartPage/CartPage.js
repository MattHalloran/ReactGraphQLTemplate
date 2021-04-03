import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { getCart, getSession } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import { Button } from '@material-ui/core';
import { updateCart, submitOrder } from 'query/http_promises';
import Cart from 'components/tables/CartTable/CartTable';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import UpdateIcon from '@material-ui/icons/Update';
import { Typography, Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'underscore';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    padTop: {
        paddingTop: theme.spacing(2),
    },
    gridItem: {
        display: 'flex',
    },
    optionsContainer: {
        width: 'fit-content',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

function CartPage() {
    let history = useHistory();
    const classes = useStyles();
    const [cart, setCart] = useState(getCart());
    // Holds cart changes before update is final
    const [changedCart, setChangedCart] = useState(cart);
    const [session, setSession] = useState(getSession());

    console.log('LOADING CART PAGE', cart, changedCart)

    const cartUpdate = (data) => {
        console.log('CART UPDATE', data)
        setChangedCart(data);
    }

    useEffect(() => {
        let cartSub = PubSub.subscribe(PUBS.Cart, (_, o) => {console.log('cart set from pub');setCart(o)});
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
            PubSub.unsubscribe(cartSub);
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Cart | ${BUSINESS_NAME.Short}`;
    })

    const updateOrder = () => {
        if (!session?.tag || !session?.token) {
            PubSub.publish(PUBS.Snack, {message: 'Failed to update order.', severity: 'error'});
            return;
        }
        updateCart(session, session.tag, changedCart)
            .then(() => {
                setCart(changedCart);
                PubSub.publish(PUBS.Snack, {message: 'Order updated.'});
            })
            .catch(err => {
                console.error(err, changedCart);
                PubSub.publish(PUBS.Snack, {message: 'Failed to update order.', severity: 'error'});
                return;
            })
    }

    const finalizeOrder = useCallback(() => {
        if (cart.items.length <= 0) {
            PubSub.publish(PUBS.Snack, {message: 'Cannot finalize order - cart is empty.', severity: 'warning'});
            return;
        }
        if (!window.confirm(`This will submit the order to ${BUSINESS_NAME.Short}. We will contact you for further information. Are you sure you want to continue?`)) return;
        submitOrder(session, changedCart)
            .then(() => {
                PubSub.publish(PUBS.AlertDialog, {message: 'Order submitted! We will be in touch with you soon :)'});
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: `Failed to submit order. Please contact ${BUSINESS_NAME.Short}`, severity: 'error'});
            })
    }, [cart, changedCart, session]);

    console.log('rendering options', _.isEqual(cart, changedCart), _.isEqual(cart.items, changedCart.items))
    let options = (
        <Grid className={classes.padTop} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => history.push(LINKS.Shopping)}
                    disabled={!_.isEqual(cart, changedCart)}
                >Continue Shopping</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<UpdateIcon />} 
                    onClick={updateOrder}
                    disabled={_.isEqual(cart, changedCart)}
                >Update Order</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={finalizeOrder}
                    disabled={!_.isEqual(cart, changedCart)}
                >Request Quote</Button>
            </Grid>
        </Grid>
    )

    return (
        <div id='page'>
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Cart</Typography>
            </div>
            { options}
            <Cart className={classes.padTop} cart={cart} onUpdate={cartUpdate} />
            { options}
        </div>
    );
}

CartPage.propTypes = {

}

export default CartPage;
