import { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSession } from 'utils/storage';
import { getOrders } from 'query/http_promises';
import Modal from 'components/wrappers/StyledModal/StyledModal';
import { Button, Card, CardActions, CardContent, Typography, Container } from '@material-ui/core';
import Cart from 'components/Cart/Cart';
import { updateCart, setOrderStatus } from 'query/http_promises';
import { findWithAttr } from 'utils/arrayTools';
import { ORDER_STATUS, ORDER_STATES } from 'utils/consts';
import UpdateIcon from '@material-ui/icons/Update';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import { makeStyles } from '@material-ui/core/styles';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';
import Selector from 'components/Selector/Selector';
import OrderDialog from 'components/OrderDialog/OrderDialog';

const useStyles = makeStyles((theme) => ({
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, .5fr))',
        gridGap: '20px',
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
            <OrderDialog 
                order={currOrder}
                open={currOrder !== null}
                onClose={() => setCurrOrder(null)} />
            <AdminBreadcrumbs />
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

const cardStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        margin: theme.spacing(1),
        padding: 10,
        minWidth: 150,
        minHeight: 50,
        cursor: 'pointer',
    },
    button: {
        color: theme.palette.primary.contrastText,
    },
}));

function OrderCard({
    onEdit,
    customer,
    items,
    desired_delivery_date,
}) {
    const classes = cardStyles();
    items.map(i => console.log(i))
    return (
        <Card className={classes.root} onClick={onEdit}>
            <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                    {customer.first_name} {customer.last_name}
                </Typography>
                <Typography variant="body1" component="h4">
                    Requested Date: {new Date(desired_delivery_date).getDate()}
                </Typography>
                <Typography variant="body1" component="h4">
                    Items: {items.length}
                </Typography>
            </CardContent>
            <CardActions>
                <Button className={classes.button} variant="text" onClick={onEdit}>View</Button>
            </CardActions>
        </Card>
    );
}

OrderCard.propTypes = {
    id: PropTypes.number,
    onEdit: PropTypes.func.isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    account_status: PropTypes.number,
    onClick: PropTypes.func,
}

// const popupStyles = makeStyles((theme) => ({
//     root: {
//         padding: theme.spacing(1),
//     },
//     optionsContainer: {
//         width: 'fit-content',
//         justifyContent: 'center',
//         '& > *': {
//             margin: theme.spacing(1),
//         },
//     },
// }));


// function OrderPopup({
//     order,
// }) {
    

//     return (
//         <div className={classes.root}>
//             <p>Customer: {order.customer.first_name} {order.customer.last_name}</p>
//             <p>{status_string}</p>
//             <Cart cart={changedOrder} onUpdate={orderUpdate} />
//             <Container className={classes.optionsContainer}>
//                 <Button startIcon={<UpdateIcon />} onClick={updateOrder}>Update Order</Button>
//                 <Button startIcon={<ThumbUpIcon />} onClick={approveOrder}>Approve</Button>
//                 <Button startIcon={<ThumbDownIcon />} onClick={denyOrder}>Deny</Button>
//             </Container>
//         </div>
//     );
// }

// OrderPopup.propTypes = {
//     order: PropTypes.object.isRequired
// }