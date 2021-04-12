import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useGet } from "restful-react";
import { PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import CustomerCard from 'components/cards/CustomerCard/CustomerCard';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, .5fr))',
        gridGap: '20px',
    },
}));

function AdminCustomerPage({
    session
}) {
    const classes = useStyles();
    const { data: customerData } = useGet({
        path: "http://localhost:5000/api/v1/customers",
        queryParams: { session: session },
        onError: () => PubSub.publish(PUBS.Snack, { message: 'Failed to load customers', severity: 'error' })
    })
    const [changedCustomers, setChangedCustomers] = useState(null);
    console.log('CUSTOMERS ISSSSSS', customerData?.customers)

    useLayoutEffect(() => {
        document.title = "Customer Page";
    }, [])

    const new_user = () => {
        alert('Coming soon!');
        return;
        //TODO
    }

    const onCustomersUpdate = (customers) => {
        setChangedCustomers(customers);
    }
    
    return (
        <div id="page">
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Button onClick={new_user}>New Customer</Button>
            </div>
            <div className={classes.cardFlex}>
                {customerData?.customers?.map((c, index) =>
                <CustomerCard key={index}
                    session={session}
                    onUpdate={onCustomersUpdate}
                    {...c} />)}
            </div>
        </div >
    );
}

AdminCustomerPage.propTypes = {
    session: PropTypes.object.isRequired,
}

export default AdminCustomerPage;