import { useLayoutEffect, useState } from 'react';
import { StyledProfilePage } from './ProfilePage.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { getTheme } from 'utils/storage';
import { PubSub } from 'utils/pubsub';

function ProfilePage() {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `Profile Page | ${BUSINESS_NAME}`;
    })

    return (
        <StyledProfilePage className="page" theme={theme}>
        </StyledProfilePage>
    );
}

ProfilePage.propTypes = {
    
}

export default ProfilePage;