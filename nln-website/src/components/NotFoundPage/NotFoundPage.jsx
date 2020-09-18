import React from 'react'
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

class NotFoundPage extends React.Component {
    render() {
        return (
            <div className="center">
                <h1>Page Not Found</h1>
                <h3>Looks like you've followed a broken link or entered a URL that doesn't exist on this site</h3>
                <br/>
                <h2 style={{ textAlign: "center" }}>
                    <Link to="/">Go to Home </Link>
                </h2>
            </div>
        );
    }
}

export default NotFoundPage;