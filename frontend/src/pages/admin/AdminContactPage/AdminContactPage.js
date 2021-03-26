import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

function AdminContactPage() {
    useLayoutEffect(() => {
        document.title = "Edit Contact Info";
    })
    return (
        <div itemID="page">

        </div>
    );
}

AdminContactPage.propTypes = {
}

export default AdminContactPage;