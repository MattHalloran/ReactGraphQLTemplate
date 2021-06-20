import { useLayoutEffect } from 'react';
import { BUSINESS_NAME } from '@local/shared';

function ProfilePage() {

    useLayoutEffect(() => {
        document.title = `Profile Page | ${BUSINESS_NAME.Short}`;
    })

    return (
        <div id="page">

        </div>
    );
}

ProfilePage.propTypes = {
    
}

export { ProfilePage };