import { useLayoutEffect } from 'react';
import { BUSINESS_NAME } from '@local/shared';

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


export { ContactPage };