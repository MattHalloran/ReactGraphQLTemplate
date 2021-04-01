import { useLayoutEffect } from 'react';
import { BUSINESS_NAME } from 'utils/consts';

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

export default ProfilePage;