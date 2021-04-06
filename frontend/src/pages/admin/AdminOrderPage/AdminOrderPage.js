import { useLayoutEffect, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getSession } from 'utils/storage';
import { getOrders } from 'query/http_promises';
import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';
import { ORDER_STATES } from 'utils/consts';
import { makeStyles } from '@material-ui/core/styles';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';
import Selector from 'components/inputs/Selector/Selector';
import OrderDialog from 'components/dialogs/OrderDialog/OrderDialog';
import OrderCard from 'components/cards/OrderCard/OrderCard';

const useStyles = makeStyles((theme) => ({
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
    const [session, setSession] = useState(getSession());
    const [filter, setFilter] = useState(ORDER_STATES[4].value);
    const [orders, setOrders] = useState([]);
    // Selected order data. Used for popup
    const [currOrder, setCurrOrder] = useState(null);

    useLayoutEffect(() => {
        document.title = "Order Page";
    })

    useEffect(() => {
        getOrders(session, filter)
            .then((response) => {
                setOrders(response.orders);
            })
            .catch((error) => {
                console.error("Failed to load orders", error);
            });
    }, [filter])

    return (
        <div id="page">
            {currOrder ? (<OrderDialog 
                order={currOrder}
                open={currOrder !== null}
                onClose={() => setCurrOrder(null)} />) : null}
            <AdminBreadcrumbs className={classes.padBottom}/>
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

export default AdminOrderPage;