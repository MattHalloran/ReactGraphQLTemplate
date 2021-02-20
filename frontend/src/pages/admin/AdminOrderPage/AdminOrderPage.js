import { useLayoutEffect, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledAdminOrderPage, StyledOrderCard } from './AdminOrderPage.styled';
import { getTheme, getSession } from 'utils/storage';
import DropDown from 'components/inputs/DropDown/DropDown';
import { getOrders } from 'query/http_promises';

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
    const [filter, setFilter] = useState(ORDER_STATES[0].value);
    const [orders, setOrders] = useState([]);

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

    return (
        <StyledAdminOrderPage className="page" theme={theme}>
            <DropDown options={ORDER_STATES} onChange={handleFilterChange} initial_value={ORDER_STATES[0]} />
            <div className="card-flex">
                {orders?.map((c, index) => <OrderCard key={index} {...c} />)}
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
    customer,
    items,
    special_instructions,
}) {
    items.map(i => console.log(i))
    return (
        <StyledOrderCard theme={theme} >
            <p>{customer.first_name} {customer.last_name}</p>
            <ul>
                {items.map((i, index) => <li key={index}>
                    <p>{i.sku.plant.latin_name} - {i.quantity}</p>
                </li>)}
            </ul>
        </StyledOrderCard>
    );
}

OrderCard.propTypes = {
    id: PropTypes.number,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    account_status: PropTypes.number,
    onClick: PropTypes.func,
}