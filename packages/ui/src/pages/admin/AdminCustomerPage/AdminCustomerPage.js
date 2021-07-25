import React, { useEffect, useState } from 'react';
import { customersQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { PUBS, PubSub } from 'utils';
import {
    AdminBreadcrumbs,
    CustomerCard
} from 'components';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';

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
    const { error, data } = useQuery(customersQuery);
    if (error) { 
        console.error(error);
        PubSub.publish(PUBS.Snack, { message: error.message, severity: 'error' });
    }
    useEffect(() => {
        setCustomers(data?.users);
    }, [data])

    const new_user = () => {
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
                <Button onClick={new_user}>New Customer</Button>
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