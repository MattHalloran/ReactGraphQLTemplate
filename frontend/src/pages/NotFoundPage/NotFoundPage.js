import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { StyledNotFoundPage } from './NotFoundPage.styled';
import { BUSINESS_NAME } from 'utils/consts';
import { Button } from '@material-ui/core';

function NotFoundPage() {

    useLayoutEffect(() => {
        document.title = `404 | ${BUSINESS_NAME}`;
    })

    return (
        <StyledNotFoundPage className="page">
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