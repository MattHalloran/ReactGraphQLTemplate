import { useLayoutEffect } from 'react';
import { BUSINESS_NAME } from 'utils/consts';

function ContactPage() {
    useLayoutEffect(() => {
        document.title = `Contact | ${BUSINESS_NAME.Short}`;
    })
    return (
        <div id='page'>

        </div>
    );
}

ContactPage.propTypes = {
}


export default ContactPage;