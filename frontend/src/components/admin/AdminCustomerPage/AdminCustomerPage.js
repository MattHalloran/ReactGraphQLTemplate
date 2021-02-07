import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyledAdminCustomerPage, StyledCustomerCard } from './AdminCustomerPage.styled';
import PropTypes from 'prop-types';
import { getCustomers } from 'query/http_promises';
import { LOCAL_STORAGE } from 'consts';
import { getItem, getTheme } from 'storage';

function AdminCustomerPage({
    session = getItem(LOCAL_STORAGE.Session),
    theme = getTheme(),
}) {
    console.log('ADMIN CUTOMER PAGE RENDER')
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        console.log("CUSTOMERS UPDATED", customers);
    }, [customers])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Customer Page";
        getCustomers(session?.email, session?.token)
            .then((response) => {
                if (!mounted) return;
                setCustomers(response.customers);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });
        return () =>  mounted = false;
    }, [])

    return (
        <StyledAdminCustomerPage theme={theme}>
            <div className="card-flex">
                {customers.map((c, index) => <CustomerCard key={index} {...c}/>)}
            </div>
        </StyledAdminCustomerPage >
    );
}

AdminCustomerPage.propTypes = {
    session: PropTypes.object.isRequired,
    theme: PropTypes.object,
}

export default AdminCustomerPage;

function CustomerCard({
    first_name,
    last_name,
    theme = getTheme(),
}) {
    return (
        <StyledCustomerCard theme={theme}>
            <p>Name: {first_name} {last_name}</p>
        </StyledCustomerCard>
    );
}

CustomerCard.propTypes = {
    first_name: PropTypes.string,
    last_name: PropTypes.string,
}