import { useState, useCallback } from 'react';
import PropTypes from "prop-types";
import { useHistory } from 'react-router';
import { BUSINESS_NAME, PUBS, LINKS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { Button } from '@material-ui/core';
import { useMutate } from "restful-react";
import { submitOrder } from 'query/http_promises';
import { CartTable as Cart } from 'components';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { Typography, Grid } from '@material-ui/core';
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

function CartPage({
    session,
    cart,
}) {
    let history = useHistory();
    const classes = useStyles();
    // Holds cart changes before update is final
    const [changedCart, setChangedCart] = useState(cart);

    console.log('LOADING CART PAGE', cart, changedCart)

    const { mutate: updateCart, loading } = useMutate({
        verb: 'PUT',
        path: 'cart',
        resolve: (response) => {
            if (response.ok) {
                setChangedCart(response.cart);
                PubSub.publish(PUBS.Snack, { message: 'Order successfully updated.' });
            }
            else {
                console.error(response.msg);
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
            }
        }
    });

    const cartUpdate = (data) => {
        console.log('CART UPDATE', data)
        setChangedCart(data);
    }

    const updateOrder = () => {
        if (!session?.tag || !session?.token) {
            PubSub.publish(PUBS.Snack, {message: 'Failed to update order.', severity: 'error'});
            return;
        }
        updateCart(session, session.tag, changedCart);
    }

    function requestQuote() {
        submitOrder(session, changedCart)
            .then(() => {
                PubSub.publish(PUBS.AlertDialog, {message: 'Order submitted! We will be in touch with you soon :)'});
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.AlertDialog, {message: `Failed to submit order. Please contact ${BUSINESS_NAME.Short}`, severity: 'error'});
            })
    }

    const finalizeOrder = useCallback(() => {
        if (cart.items.length <= 0) {
            PubSub.publish(PUBS.Snack, {message: 'Cannot finalize order - cart is empty.', severity: 'warning'});
            return;
        }
        PubSub.publish(PUBS.AlertDialog, {
            message: `This will submit the order to ${BUSINESS_NAME.Short}. We will contact you for further information. Are you sure you want to continue?`,
            firstButtonText: 'Yes',
            firstButtonClicked: requestQuote,
            secondButtonText: 'No',
        });
    }, [cart, changedCart, session]);

    console.log('rendering options', _.isEqual(cart, changedCart), _.isEqual(cart?.items, changedCart?.items))
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
    session: PropTypes.object,
    cart: PropTypes.object,
}

export default CartPage;
