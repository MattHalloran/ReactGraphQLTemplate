import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSession } from 'utils/storage';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Container } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Cart from 'components/Cart/Cart';
import { updateCart, setOrderStatus } from 'query/http_promises';
import { findWithAttr } from 'utils/arrayTools';
import { ORDER_STATUS, ORDER_STATES } from 'utils/consts';
import UpdateIcon from '@material-ui/icons/Update';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    optionsContainer: {
        width: 'fit-content',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function OrderDialog({
    order,
    open = true,
    onClose,
}) {
    console.log('ORDER POPUP', order);
    const classes = useStyles();
    // Holds order changes before update is final
    const [changedOrder, setChangedOrder] = useState(order);
    const [session, setSession] = useState(getSession());

    const orderUpdate = (data) => {
        setChangedOrder(data);
    }

    const updateOrder = () => {
        if (!session?.tag || !session?.token) {
            alert('Error: Could not update order!');
            return;
        }
        updateCart(session, session.tag, changedOrder)
            .then(() => {
                alert('Order updated')
            })
            .catch(err => {
                console.error(err, changedOrder);
                alert('Error: Could not update order!');
                return;
            })
    }

    const approveOrder = useCallback(() => {
        setOrderStatus(session, changedOrder?.id, ORDER_STATUS.APPROVED)
            .then(() => {
                alert('Order status set to \'Approved\'')
            }).catch(err => {
                console.error(err);
                alert('Error: could not approve order!')
            })
    }, [changedOrder])

    const denyOrder = useCallback(() => {
        setOrderStatus(session, changedOrder?.id, ORDER_STATUS.REJECTED)
            .then(() => {
                alert('Order status set to \'Denied\'')
            }).catch(err => {
                console.error(err);
                alert('Error: could not approve order!')
            })
    }, [changedOrder])

    let status_string;
    let status_index = findWithAttr(ORDER_STATES, 'value', order?.status);
    if (status_index >= 0) {
        status_string = `Status: ${ORDER_STATES[status_index].label}`
    }

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {order?.customer?.first_name} {order?.customer?.last_name}'s Order
                        </Typography>
                    <Container className={classes.optionsContainer}>
                        <Button startIcon={<UpdateIcon />} onClick={updateOrder}>Update</Button>
                        <Button startIcon={<ThumbUpIcon />} onClick={approveOrder}>Approve</Button>
                        <Button startIcon={<ThumbDownIcon />} onClick={denyOrder}>Deny</Button>
                    </Container>
                </Toolbar>
            </AppBar>
            <p>{status_string}</p>
            <Cart cart={changedOrder} onUpdate={orderUpdate} />
        </Dialog>
    );
}

OrderDialog.propTypes = {
    order: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export default OrderDialog;