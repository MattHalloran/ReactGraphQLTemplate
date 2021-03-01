import { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminOrderPage, StyledOrderCard, StyledOrderPopup } from './AdminOrderPage.styled';
import { getTheme, getSession, getItem } from 'utils/storage';
import DropDown from 'components/inputs/DropDown/DropDown';
import { getOrders } from 'query/http_promises';
import Modal from 'components/wrappers/Modal/Modal';
import Button from 'components/Button/Button';
import Cart from 'components/Cart/Cart';
import { updateCart, setOrderStatus } from 'query/http_promises';
import { updateObject } from 'utils/objectTools';
import { findWithAttr } from 'utils/arrayTools';
import { ORDER_STATUS } from 'utils/consts';

const ORDER_STATES = [
    {
        label: 'Canceled by Admin',
        value: -4,
    },
    {
        label: 'Canceled by User',
        value: -3,
    },
    {
        label: 'Pending Cancel',
        value: -2,
    },
    {
        label: 'Rejected',
        value: -1,
    },
    {
        label: 'Pending',
        value: 1,
    },
    {
        label: 'Approved',
        value: 2,
    },
    {
        label: 'Scheduled',
        value: 3,
    },
    {
        label: 'In Transit',
        value: 4,
    },
    {
        label: 'Delivered',
        value: 5,
    },
]

function AdminOrderPage({
    theme = getTheme(),
}) {
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

    const handleFilterChange = (sort_item, _) => {
        setFilter(sort_item.value);
    }

    let popup = (currOrder) ? (
        <Modal onClose={() => setCurrOrder(null)}>
            <OrderPopup theme={theme} order={currOrder} />
        </Modal>
    ) : null;

    return (
        <StyledAdminOrderPage className="page" theme={theme}>
            {popup}
            <DropDown options={ORDER_STATES} onChange={handleFilterChange} initial_value={ORDER_STATES[4]} />
            <div className="card-flex">
                {orders?.map((c, index) => <OrderCard key={index} onEdit={() => setCurrOrder(c)} {...c} />)}
            </div>
        </StyledAdminOrderPage >
    );
}

AdminOrderPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminOrderPage;

function OrderCard({
    theme = getTheme(),
    onEdit,
    customer,
    items,
    desired_delivery_date,
}) {
    items.map(i => console.log(i))
    return (
        <StyledOrderCard theme={theme} onClick={onEdit} >
            <p>{customer.first_name} {customer.last_name}</p>
            <p>Requested Date: {new Date(desired_delivery_date).getDate()}</p>
            <p>Items: {items.length}</p>
        </StyledOrderCard>
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


function OrderPopup({
    order,
    theme = getTheme(),
}) {
    console.log('ORDER POPUP', order);
    // Holds order changes before update is final
    const [changedOrder, setChangedOrder] = useState(order);
    const [session, setSession] = useState(getSession());

    const orderUpdate = (data) => {
        setChangedOrder(data);
    }

    const updateOrder = () => {
        if (!session?.email || !session?.token) {
            alert('Error: Could not update order!');
            return;
        }
        updateCart(session, session.email, changedOrder)
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
        setOrderStatus(session, changedOrder.id, ORDER_STATUS.APPROVED)
            .then(() => {
                alert('Order status set to \'Approved\'')
            }).catch(err => {
                console.error(err);
                alert('Error: could not approve order!')
            })
    }, [changedOrder])

    const denyOrder = useCallback(() => {
        setOrderStatus(session, changedOrder.id, ORDER_STATUS.REJECTED)
            .then(() => {
                alert('Order status set to \'Denied\'')
            }).catch(err => {
                console.error(err);
                alert('Error: could not approve order!')
            })
    }, [changedOrder])

    let status_string;
    let status_index = findWithAttr(ORDER_STATES, 'value', order.status);
    if (status_index >= 0) {
        status_string = `Status: ${ORDER_STATES[status_index].label}`
    }

    return (
        <StyledOrderPopup>
            <p>Customer: {order.customer.first_name} {order.customer.last_name}</p>
            <p>{status_string}</p>
            <Cart cart={changedOrder} onUpdate={orderUpdate} />
            <div>
                <Button onClick={updateOrder}>Update Order</Button>
                <Button onClick={approveOrder}>Approve</Button>
                <Button onClick={denyOrder}>Deny</Button>
                <Button>Contact</Button>
            </div>
        </StyledOrderPopup>
    );
}

OrderPopup.propTypes = {
    order: PropTypes.object.isRequired,
    theme: PropTypes.object,
}