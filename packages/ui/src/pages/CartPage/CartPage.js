import { useState, useCallback } from 'react';
import PropTypes from "prop-types";
import { useHistory } from 'react-router';
import { LINKS, PUBS, PubSub } from 'utils';
import { Button } from '@material-ui/core';
import { useMutate } from "restful-react";
import { submitOrder } from 'query/http_promises';
import { CartTable } from 'components';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
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
    user_id,
    cart,
}) {
    let history = useHistory();
    const classes = useStyles();
    // Holds cart changes before update is final
    const [currCart, setcurrCart] = useState(null)
    const [changedCart, setChangedCart] = useState(null);

    console.log('LOADING CART PAGE', cart, changedCart)

    const { mutate: updateCart } = useMutate({
        verb: 'PUT',
        path: 'cart',
        resolve: (response) => {
            if (response.ok) {
                setChangedCart(response.cart);
                PubSub.publish(PUBS.Snack, { message: 'Order successfully updated.' });
            }
            else {
                console.error(response.message);
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            }
        }
    });

    const cartUpdate = useCallback((data) => {
        console.log('CART UPDATE', data);
        if (currCart === null && data !== null) setcurrCart(data);
        setChangedCart(data);
    }, [currCart])

    const updateOrder = () => {
        if (!user_id) {
            PubSub.publish(PUBS.Snack, {message: 'Failed to update order.', severity: 'error'});
            return;
        }
        updateCart(user_id, changedCart);
    }

    function requestQuote() {
        submitOrder(changedCart)
            .then(() => {
                PubSub.publish(PUBS.AlertDialog, {message: 'Order submitted! We will be in touch with you soon :)'});
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.AlertDialog, {message: `Failed to submit order. Please contact ${business?.BUSINESS_NAME?.Short}`, severity: 'error'});
            })
    }

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
    }, [cart, changedCart, currCart, requestQuote, user_id]);

    console.log('rendering options', _.isEqual(cart, changedCart), _.isEqual(cart?.items, changedCart?.items))
    let options = (
        <Grid className={classes.padTop} container spacing={2}>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => history.push(LINKS.Shopping)}
                    disabled={changedCart !== null && !_.isEqual(cart, changedCart)}
                >Continue Shopping</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    startIcon={<UpdateIcon />} 
                    onClick={updateOrder}
                    disabled={changedCart === null || _.isEqual(cart, changedCart)}
                >Update Order</Button>
            </Grid>
            <Grid className={classes.gridItem} justify="center" item xs={12} sm={4}>
                <Button 
                    fullWidth 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={finalizeOrder}
                    disabled={changedCart !== null && !_.isEqual(cart, changedCart)}
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
    user_id: PropTypes.string,
    cart: PropTypes.object,
}

export { CartPage };
