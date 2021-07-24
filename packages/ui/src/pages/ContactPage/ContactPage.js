import React from 'react';
import { useLayoutEffect } from 'react';

function ContactPage({
    business,
}) {
    useLayoutEffect(() => {
        document.title = `Contact | ${business?.BUSINESS_NAME?.Short}`;
    })
    return (
        <div id='page'>

        </div>
    );
}

ContactPage.propTypes = {
}


export { ContactPage };