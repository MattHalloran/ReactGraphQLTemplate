import React, { useState, useCallback } from 'react';
import PropTypes from "prop-types";
import { useHistory } from 'react-router';
import { LINKS, PUBS, PubSub } from 'utils';
import { Button } from '@material-ui/core';
import { CartTable } from 'components';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { updateOrderMutation, submitOrderMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
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
    business,
    customer_id,
    cart,
}) {
    let history = useHistory();
    const classes = useStyles();
    // Holds cart changes before update is final
    const [currCart, setcurrCart] = useState(null)
    const [changedCart, setChangedCart] = useState(null);
    const [updateOrder, {loading}] = useMutation(updateOrderMutation);
    const [submitOrder] = useMutation(submitOrderMutation);

    console.log('LOADING CART PAGE', cart, changedCart)

    const orderUpdate = () => {
        if (!customer_id) {
            PubSub.publish(PUBS.Snack, {message: 'Failed to update order.', severity: 'error' });
            return;
        }
        PubSub.publish(PUBS.Loading, true);
        updateOrder({ variables: { input: changedCart } }).then((response) => {
            const data = response.data.updateOrder;
            PubSub.publish(PUBS.Loading, false);
            if (data !== null) {
                setChangedCart(data);
                PubSub.publish(PUBS.Snack, { message: 'Order successfully updated.' });
            } else PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error' });
        }).catch((response) => {
            PubSub.publish(PUBS.Loading, false);
            PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error', data: response });
        })
    }

    const cartUpdate = useCallback((data) => {
        console.log('CART UPDATE', data);
        if (currCart === null && data !== null) setcurrCart(data);
        setChangedCart(data);
    }, [currCart])

    const requestQuote = useCallback(() => {
        submitOrder({ variables: { id: cart.id } })
            .then(() => {
                PubSub.publish(PUBS.AlertDialog, {message: 'Order submitted! We will be in touch with you soon :)'});
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.AlertDialog, {message: `Failed to submit order. Please contact ${business?.BUSINESS_NAME?.Short}`, severity: 'error'});
            })
    }, [cart, business, submitOrder])

    const finalizeOrder = useCallback(() => {
        // Make sure order is updated
        if (!_.isEqual(currCart, changedCart)) {
            PubSub.publish(PUBS.Snack, {message: 'Please click "UPDATE ORDER" before submitting.', severity: 'warning'});
            return;
        }
        // Disallow empty orders
        if (currCart.items.length <= 0) {
            PubSub.publish(PUBS.Snack, {message: 'Cannot finalize order - cart is empty.', severity: 'warning'});
            return;
        }
        PubSub.publish(PUBS.AlertDialog, {
            message: `This will submit the order to ${business?.BUSINESS_NAME?.Short}. We will contact you for further information. Are you sure you want to continue?`,
            firstButtonText: 'Yes',
            firstButtonClicked: requestQuote,
            secondButtonText: 'No',
        });
    }, [changedCart, currCart, requestQuote, business]);

    console.log('rendering options', _.isEqual(cart, changedCart), _.isEqual(cart?.items, changedCart?.items))
    let options = (
        <Grid className={classes.padTop} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => history.push(LINKS.Shopping)}
                    disabled={loading || (changedCart !== null && !_.isEqual(cart, changedCart))}
                >Continue Shopping</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<UpdateIcon />} 
                    onClick={orderUpdate}
                    disabled={loading || (changedCart === null || _.isEqual(cart, changedCart))}
                >Update Order</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={finalizeOrder}
                    disabled={loading || (changedCart !== null && !_.isEqual(cart, changedCart))}
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
            <CartTable className={classes.padTop} cart={cart} onUpdate={cartUpdate} />
            { options}
        </div>
    );
}

CartPage.propTypes = {
    customer_id: PropTypes.string,
    cart: PropTypes.object,
}

export { CartPage };
