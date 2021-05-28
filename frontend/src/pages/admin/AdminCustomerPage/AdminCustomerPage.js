import { useState } from 'react';
import { useGet } from "restful-react";
import { PUBS, PubSub } from 'utils';
import {
    AdminBreadcrumbs,
    CustomerCard
} from 'components';
import { makeStyles } from '@material-ui/core/styles';
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

function AdminCustomerPage({
}) {
    const classes = useStyles();
    const [customers, setCustomers] = useState(null);
    useGet({
        path: "customers",
        resolve: (response) => {
            if (response.ok)
                setCustomers(response.customers);
            else
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
        }
    })

    const new_user = () => {
        alert('Coming soon!');
        return;
        //TODO
    }

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
                <CustomerCard key={index}
                    onUpdate={onCustomersUpdate}
                    {...c} />)}
            </div>
        </div >
    );
}

AdminCustomerPage.propTypes = {
}

export { AdminCustomerPage };