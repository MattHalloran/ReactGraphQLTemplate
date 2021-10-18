import { useEffect, useState } from 'react';
import { customersQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';
import { PUBS } from 'utils';
import PubSub from 'pubsub-js';
import {
    AdminBreadcrumbs,
    CustomerCard
} from 'components';
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@material-ui/core';
import { Button, Typography } from '@material-ui/core';
import { CustomerDialog } from 'components/dialogs/CustomerDialog';
import { NewCustomerDialog } from 'components/dialogs/NewCustomerDialog';
import { pageStyles } from '../styles';
import { combineStyles } from 'utils';
import { Customer } from '@local/shared';

const componentStyles = () => ({
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, .5fr))',
        gridGap: '20px',
    },
})

const useStyles = makeStyles(combineStyles(pageStyles, componentStyles));

export const AdminCustomerPage = () => {
    const classes = useStyles();
    const theme = useTheme();
    const [customers, setCustomers] = useState<any>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [newCustomerOpen, setNewCustomerOpen] = useState(false);
    const { error, data } = useQuery(customersQuery, { pollInterval: 5000 });
    if (error) { 
        PubSub.publish(PUBS.Snack, { message: error.message, severity: 'error', data: error });
    }
    useEffect(() => {
        setCustomers(data?.customers);
    }, [data])

    return (
        <div id="page">
            <CustomerDialog
                customer={selectedCustomer}
                open={selectedCustomer !== null}
                onClose={() => setSelectedCustomer(null)} />
            <NewCustomerDialog
                open={newCustomerOpen}
                onClose={() => setNewCustomerOpen(false)} />
            <AdminBreadcrumbs textColor={theme.palette.secondary.dark} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Customers</Typography>
                <Button color="secondary" onClick={() => setNewCustomerOpen(true)}>Create Customer</Button>
            </div>
            <div className={classes.cardFlex}>
                {customers?.map((c, index) =>
                <CustomerCard 
                    key={index}
                    onEdit={(data) => setSelectedCustomer(data)}
                    customer={c}
                />)}
            </div>
        </div >
    );
}