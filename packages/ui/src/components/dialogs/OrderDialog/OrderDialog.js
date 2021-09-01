import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    AppBar,
    Button, 
    Dialog, 
    Grid,
    IconButton, 
    Slide,
    Toolbar,  
    Typography,   
} from '@material-ui/core';
import {
    Close as CloseIcon,
    ThumbDown as ThumbDownIcon,
    ThumbUp as ThumbUpIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { CartTable as Cart } from 'components';
import { updateOrderMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { findWithAttr, ORDER_STATES } from 'utils';
import { ORDER_STATUS } from '@local/shared';
import _ from 'lodash';
import { mutationWrapper } from 'graphql/wrappers';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    container: {
        padding: theme.spacing(1),
    },
    topOption: {
        width: 'max(9em, 40%)',
        align: 'right',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
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
    const classes = useStyles();
    // Holds order changes before update is final
    const [changedOrder, setChangedOrder] = useState(order);
    const [updateOrder, {loading}] = useMutation(updateOrderMutation);

    useEffect(() => {
        setChangedOrder(order);
    }, [order])

    const orderUpdate = () => {
        mutationWrapper({
            mutation: updateOrder,
            data: { variables: { input: order } },
            successCondition: (response) => response.data.updateOrder !== null,
            successMessage: () => 'Order successfully updated.',
            onSuccess: (response) => setChangedOrder(response.data.updateOrder),
        })
    }

    const approveOrder = useCallback(() => {
        mutationWrapper({
            mutation: updateOrder,
            data: { variables: { input: { ...order, status: ORDER_STATUS.Approved } } },
            successMessage: () => 'Order status set to \'Approved\'.',
            errorMessage: () => 'Failed to approve order.',
        })
    }, [order, updateOrder])

    const denyOrder = useCallback(() => {
        mutationWrapper({
            mutation: updateOrder,
            data: { variables: { input: { ...order, status: ORDER_STATUS.Rejected } } },
            successMessage: () => 'Order status set to \'Denied\'.',
            errorMessage: () => 'Failed to deny order.',
        })
    }, [order, updateOrder])

    let status_string;
    let status_index = findWithAttr(ORDER_STATES, 'value', order?.status);
    if (status_index >= 0) {
        status_string = `Status: ${ORDER_STATES[status_index].label}`
    }

    function optionButtons(is_top) {
        let sm_num = is_top ? 12 : 4;
        return (
            <Grid className={is_top ? classes.topOption : ''} container spacing={1}>
                <Grid item xs={12} sm={sm_num} md={4}>
                    <Button
                        fullWidth
                        startIcon={<UpdateIcon />}
                        onClick={orderUpdate}
                        disabled={loading || _.isEqual(order, changedOrder)}
                    >Update</Button>
                </Grid>
                <Grid item xs={12} sm={sm_num} md={4}>
                    <Button
                        fullWidth
                        startIcon={<ThumbUpIcon />}
                        onClick={approveOrder}
                        disabled={loading || !_.isEqual(order, changedOrder)}
                    >Approve</Button>
                </Grid>
                <Grid item xs={12} sm={sm_num} md={4}>
                    <Button
                        fullWidth
                        startIcon={<ThumbDownIcon />}
                        onClick={denyOrder}
                        disabled={loading || !_.isEqual(order, changedOrder)}
                    >Deny</Button>
                </Grid>
            </Grid>
        )
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
                    {optionButtons(true)}
                </Toolbar>
            </AppBar>
            <div className={classes.container}>
                <Typography variant="body1" gutterBottom>{status_string}</Typography>
                <Cart cart={order} onUpdate={(data) => setChangedOrder(data)} />
                <br/>
                {optionButtons(false)}
            </div>
        </Dialog>
    );
}

OrderDialog.propTypes = {
    order: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
}

export { OrderDialog };