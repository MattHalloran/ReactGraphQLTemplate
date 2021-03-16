import { useLayoutEffect, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StyledNotFoundPage } from './NotFoundPage.styled';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import { getTheme } from 'utils/storage';

function NotFoundPage() {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
        })
    }, [])

    useLayoutEffect(() => {
        document.title = `404 | ${BUSINESS_NAME}`;
    })

    return (
        <StyledNotFoundPage className="page" theme={theme}>
            <div className="center">
                <h1>Page Not Found</h1>
                <h3>Looks like you've followed a broken link or entered a URL that doesn't exist on this site</h3>
                <br />
                <Link to="/">
                    <Button className="primary">Go to Home</Button>
                </Link>
            </div>
        </StyledNotFoundPage>
    );
}

NotFoundPage.propTypes = {
    
}

export default NotFoundPage;