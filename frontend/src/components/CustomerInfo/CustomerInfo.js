import React from 'react';
import PropTypes from 'prop-types';
import { StyledCustomerInfo } from './CustomerInfo.styled';
import { getTheme } from 'utils/storage';

function CustomerInfo({
    customer,
    theme = getTheme(),
}) {
    let customerInfo;
    if (customer) {
        customerInfo = <React.Fragment>
            <p>Name: {customer.first_name} {customer.last_name}</p>
            <p>Pronouns: {customer.pronouns}</p>
            {customer.emails?.map(e => <p>Email: <a href={`mailto:${e.email_address}`}>{e.email_address}</a></p>)}
            {customer.phones?.map(p => <p>Phone: <a href={`tel:${p.country_code}${p.unformatted_number}`}>{p.unformatted_number}</a></p>)}
        </React.Fragment>
    }

    return (
        <StyledCustomerInfo theme={theme}>
                {customerInfo}
        </StyledCustomerInfo >
    );
}

CustomerInfo.propTypes = {
    customer: PropTypes.object.isRequired,
    theme: PropTypes.object,
}

export default CustomerInfo;