import { useState, useEffect } from 'react';
import { useGet } from "restful-react";
import { ORDER_STATES, PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import {
    AdminBreadcrumbs,
    OrderCard,
    OrderDialog,
    Selector
} from 'components';

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
    const [filter, setFilter] = useState(ORDER_STATES[4].value);
    // Selected order data. Used for popup
    const [currOrder, setCurrOrder] = useState(null);

    const { data: orders, refetch: getOrders } = useGet({
        path: "orders",
        lazy: true,
        queryParams: { filter: filter },
        resolve: (response) => {
            if (!response.ok)
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
        }
    })

    useEffect(() => {
        getOrders();
    }, [filter, getOrders])

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

export { AdminOrderPage };