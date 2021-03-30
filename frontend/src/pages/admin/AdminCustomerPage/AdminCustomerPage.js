import { useEffect, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getCustomers } from 'query/http_promises';
import { PUBS } from 'utils/consts';
import { getSession } from 'utils/storage';
import { PubSub } from 'utils/pubsub';
import CustomerCard from 'components/CustomerCard/CustomerCard';
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

function AdminCustomerPage() {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Customer Page";
        getCustomers(session)
            .then((response) => {
                if (!mounted) return;
                setCustomers(response.customers);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });
        return () => mounted = false;
    }, [session])

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
            <div className={classes.header}>
                <Button onClick={new_user}>New Customer</Button>
            </div>
            <div className={classes.cardFlex}>
                {customers?.map((c, index) =>
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