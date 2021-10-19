import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    AppBar,
    Button,
    Dialog,
    Grid,
    IconButton,
    Theme,
    Toolbar,
    Typography,
} from '@material-ui/core';
import {
    Block as BlockIcon,
    Close as CloseIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon,
    Edit as EditIcon,
    EventAvailable as EventAvailableIcon,
    LocalShipping as LocalShippingIcon,
    ThumbDown as ThumbDownIcon,
    ThumbUp as ThumbUpIcon,
    Update as UpdateIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { CartTable } from 'components';
import { updateOrderMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { findWithAttr, ORDER_FILTERS } from 'utils';
import { ROLES } from '@local/shared';
import isEqual from 'lodash/isEqual';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { UpTransition } from 'components';
import { updateOrder } from 'graphql/generated/updateOrder';
import { Order, UserRoles } from 'types';
import { OrderStatus } from 'graphql/generated/globalTypes';

const useStyles = makeStyles((theme: Theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        textAlign: 'center',
    },
    optionsContainer: {
        padding: theme.spacing(2),
    },
    container: {
        background: theme.palette.background.default,
        flex: 'auto',
        paddingBottom: '15vh',
    },
    pad: {
        padding: theme.spacing(1),
    },
    bottom: {
        background: theme.palette.primary.main,
        position: 'fixed',
        bottom: '0',
        width: '-webkit-fill-available',
        zIndex: 1,
    },
}));

const editableStatuses = [OrderStatus.PENDING_CANCEL, OrderStatus.PENDING, OrderStatus.APPROVED, OrderStatus.SCHEDULED]

interface Props {
    order: Order | null;
    userRoles: UserRoles;
    open?: boolean;
    onClose: () => any;
}

export const OrderDialog = ({
    order,
    userRoles,
    open = true,
    onClose,
}: Props) => {
    const classes = useStyles();
    // Holds order changes before update is final
    const [changedOrder, setChangedOrder] = useState<Order | null>(order);
    const [updateOrder, { loading }] = useMutation<updateOrder>(updateOrderMutation);

    useEffect(() => {
        setChangedOrder(order);
    }, [order])

    const orderUpdate = () => {
        mutationWrapper({
            mutation: updateOrder,
            data: {
                variables: {
                    input: {
                        id: changedOrder?.id,
                        desiredDeliveryDate: changedOrder?.desiredDeliveryDate,
                        isDelivery: changedOrder?.isDelivery,
                        items: changedOrder?.items?.map(i => ({ id: i.id, quantity: i.quantity }))
                    }
                }
            },
            successCondition: (response) => response.data.updateOrder !== null,
            successMessage: () => 'Order successfully updated.',
            onSuccess: (response) => setChangedOrder(response.data.updateOrder),
        })
    }

    const setOrderStatus = useCallback((status, successMessage, errorMessage) => {
        mutationWrapper({
            mutation: updateOrder,
            data: { variables: { input: { id: order?.id, status: status } } },
            successMessage: () => successMessage,
            errorMessage: () => errorMessage,
        })
    }, [order, updateOrder])


    // Used to set the status of the order
    // First item is a check to detemine if action is currently available.
    // The rest is the data needed to display the action and call mutationWrapper.
    const changeStatus = useMemo(() => {
        if (!order?.status) return [];
        const isCustomer = Array.isArray(userRoles) && userRoles.some(r => [ROLES.Customer].includes(r?.title));
        const isOwner = Array.isArray(userRoles) && userRoles.some(r => [ROLES.Owner, ROLES.Admin].includes(r?.title));
        const isCanceled = [OrderStatus.CANCELED_BY_ADMIN, OrderStatus.CANCELED_BY_CUSTOMER, OrderStatus.REJECTED].includes(order.status);
        const isOutTheDoor = [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED].includes(order.status);
        return {
            [OrderStatus.CANCELED_BY_ADMIN]: [
                isOwner && !isCanceled,
                'Cancel order', <BlockIcon />, 'Order canceled.', 'Failed to cancel order.'
            ],
            [OrderStatus.CANCELED_BY_CUSTOMER]: [
                isCustomer && !isCanceled && !isOutTheDoor && order?.status !== OrderStatus.APPROVED,
                'Cancel order', <BlockIcon />, 'Order canceled.', 'Failed to cancel order.'
            ],
            [OrderStatus.PENDING_CANCEL]: [
                isCustomer && order.status === OrderStatus.APPROVED,
                'Request cancellation', <BlockIcon />, 'Order cancellation requested.', 'Failed to request cancellation.'
            ],
            [OrderStatus.REJECTED]: [
                isOwner && !isCanceled,
                'Reject order', <ThumbDownIcon />, 'Order reverted back to cart.', 'Failed to change order.'
            ],
            [OrderStatus.DRAFT]: [
                isCustomer && order?.status === OrderStatus.PENDING,
                'Revoke order submission', <EditIcon />, 'Order reverted back to cart.', 'Failed to change order.'
            ],
            [OrderStatus.PENDING]: [
                isCustomer && [OrderStatus.DRAFT, OrderStatus.PENDING_CANCEL].includes(order?.status),
                'Submit order', <DoneIcon />, 'Order approved.', 'Failed to approve order.'
            ],
            [OrderStatus.APPROVED]: [
                isOwner && (order?.status === OrderStatus.PENDING || isCanceled),
                'Approve Order', <ThumbUpIcon />, 'Order approved.', 'Failed to approve order.'
            ],
            [OrderStatus.SCHEDULED]: [
                isOwner && [OrderStatus.APPROVED, OrderStatus.IN_TRANSIT].includes(order?.status),
                'Set order status to "scheduled"', <EventAvailableIcon />, 'Order status set to "scheduled".', 'Failed to update order status.'
            ],
            [OrderStatus.IN_TRANSIT]: [
                isOwner && [OrderStatus.SCHEDULED, OrderStatus.DELIVERED].includes(order?.status),
                'Set order status to "in transit"', <LocalShippingIcon />, 'Order status set to "in transit".', 'Failed to update order status.'
            ],
            [OrderStatus.DELIVERED]: [
                isOwner && order?.status === OrderStatus.IN_TRANSIT,
                'Set order status to "Delivered"', <DoneAllIcon />, 'Order status set to "delivered".', 'Failed to update order status.'
            ]
        }
    }, [order, userRoles])

    // Filter out order mutation actions that are not currently available
    const availableActions = Object.entries(changeStatus).filter(([, value]) => value[0]).map(([status, statusData]) => ({
        status,
        displayText: statusData[1],
        icon: statusData[2],
        successMessage: statusData[3],
        failureMessage: statusData[4],
    }))

    let status_string;
    let status_index = findWithAttr(ORDER_FILTERS, 'value', order?.status);
    if (status_index >= 0) {
        status_string = `Status: ${ORDER_FILTERS[status_index].label}`
    }

    let options = (
        <Grid className={classes.optionsContainer} container spacing={1}>
            <Grid item xs={12} sm={4}>
                <Button
                    fullWidth
                    startIcon={<UpdateIcon />}
                    onClick={orderUpdate}
                    disabled={loading || isEqual(order, changedOrder)}
                >Update</Button>
            </Grid>
            {availableActions.map(action => (
                <Grid item xs={12} sm={4}>
                    <Button
                        fullWidth
                        startIcon={action.icon}
                        onClick={() => setOrderStatus(action.status, action.successMessage, action.failureMessage)}
                        disabled={loading || !isEqual(order, changedOrder)}
                    >{action.displayText}</Button>
                </Grid>
            ))}
        </Grid>
    )

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={UpTransition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Grid container spacing={0}>
                        <Grid className={classes.title} item xs={12}>
                            <Typography variant="h5">
                                {`${order?.customer?.firstName} ${order?.customer?.lastName}`}'s order
                            </Typography>
                            <Typography variant="h6">
                                {order?.customer?.business?.name}
                            </Typography>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <div className={classes.container}>
                <div className={classes.pad}>
                    <Typography variant="body1" gutterBottom>{status_string}</Typography>
                    <CartTable cart={order} editable={order?.status && editableStatuses.includes(order?.status)} onUpdate={(data) => setChangedOrder(data)} />
                </div>
                <div className={classes.bottom}>
                    {options}
                </div>
            </div>
        </Dialog>
    );
}