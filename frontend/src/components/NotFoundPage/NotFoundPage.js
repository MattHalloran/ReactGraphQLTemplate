import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom';
import { StyledNotFoundPage } from './NotFoundPage.styled';

function NotFoundPage() {
    useLayoutEffect(() => {
        document.title = "404 | New Life Nursery";
    })

    return (
        <StyledNotFoundPage>
            <div className="center">
                <h1>Page Not Found</h1>
                <h3>Looks like you've followed a broken link or entered a URL that doesn't exist on this site</h3>
                <br />
                <Link to="/">
                    <button className="primary">Go to Home</button>
                </Link>
            </div>
        </StyledNotFoundPage>
    );
}

NotFoundPage.propTypes = {

}

export default NotFoundPage;