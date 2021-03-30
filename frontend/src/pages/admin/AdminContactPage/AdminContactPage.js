import { useLayoutEffect } from 'react';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';
import PropTypes from 'prop-types';

function AdminContactPage() {
    useLayoutEffect(() => {
        document.title = "Edit Contact Info";
    })
    return (
        <div itemID="page">
            <AdminBreadcrumbs />
        </div>
    );
}

AdminContactPage.propTypes = {
}

export default AdminContactPage;