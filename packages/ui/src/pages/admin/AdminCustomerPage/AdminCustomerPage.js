import React, { useEffect, useState } from 'react';
import { customersQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { PUBS, PubSub } from 'utils';
import {
    AdminBreadcrumbs,
    CustomerCard
} from 'components';
import { makeStyles } from '@material-ui/styles';
import { Button, Typography } from '@material-ui/core';

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

function AdminCustomerPage() {
    const classes = useStyles();
    const [customers, setCustomers] = useState(null);
    const { error, data } = useQuery(customersQuery, { pollInterval: 5000 });
    if (error) { 
        PubSub.publish(PUBS.Snack, { message: error.message, severity: 'error', data: error });
    }
    useEffect(() => {
        setCustomers(data?.customers);
    }, [data])

    const new_customer = () => {
        alert('Coming soon!');
        return;
        //TODO
    }

    console.log('CUSTOMERS', customers, data)

    const onCustomersUpdate = (customers) => {
        setCustomers(customers);
    }
    
    return (
        <div id="page">
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Customers</Typography>
            </div>
            <div className={classes.header}>
                <Button onClick={new_customer}>New Customer</Button>
            </div>
            <div className={classes.cardFlex}>
                {customers?.map((c, index) =>
                <CustomerCard 
                    key={index}
                    onUpdate={onCustomersUpdate}
                    {...c} 
                />)}
            </div>
        </div >
    );
}

AdminCustomerPage.propTypes = {
}

export { AdminCustomerPage };