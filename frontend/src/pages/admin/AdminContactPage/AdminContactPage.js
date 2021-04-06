import { useLayoutEffect } from 'react';
import AdminBreadcrumbs from 'components/breadcrumbs/AdminBreadcrumbs/AdminBreadcrumbs';

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