import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { BUSINESS_NAME } from 'utils/consts';

function ContactPage() {
    useLayoutEffect(() => {
        document.title = `Contact | ${BUSINESS_NAME}`;
    })
    return (
        <div id='page'>

        </div>
    );
}

ContactPage.propTypes = {
}


export default ContactPage;