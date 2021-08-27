import React, { useState, useEffect } from 'react';
import { ordersQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { ORDER_STATES, PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import {
    AdminBreadcrumbs,
    OrderCard,
    OrderDialog,
    Selector,
} from 'components';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gridGap: '20px',
    },
    padBottom: {
        marginBottom: theme.spacing(2),
    },
}));

function AdminOrderPage() {
    const classes = useStyles();
    const [filter, setFilter] = useState(ORDER_STATES[4].value);
    // Selected order data. Used for popup
    const [currOrder, setCurrOrder] = useState(null);
    const [orders, setOrders] = useState(null);
    const { error, data, refetch } = useQuery(ordersQuery, { variables: { status: filter }, pollInterval: 5000 });
    if (error) { 
        PubSub.publish(PUBS.Snack, { message: error.message, severity: 'error', data: error });
    }
    useEffect(() => {
        setOrders(data?.orders);
    }, [data])

    useEffect(() => {
        refetch();
    }, [filter, refetch])

    return (
        <div id="page">
            {currOrder ? (<OrderDialog 
                order={currOrder}
                open={currOrder !== null}
                onClose={() => setCurrOrder(null)} />) : null}
            <AdminBreadcrumbs className={classes.padBottom}/>
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Orders</Typography>
            </div>
            <Selector
                fullWidth
                options={ORDER_STATES}
                selected={filter}
                handleChange={(e) => setFilter(e.target.value)}
                inputAriaLabel='order-type-selector-label'
                label="Sort By" />
            <h3>Count: {orders?.length ?? 0}</h3>
            <div className={classes.cardFlex}>
                {orders?.map((c, index) => <OrderCard key={index} onEdit={() => setCurrOrder(c)} {...c} />)}
            </div>
        </div >
    );
}

AdminOrderPage.propTypes = {
}

export { AdminOrderPage };