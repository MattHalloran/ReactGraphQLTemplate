import React from 'react'
import { Link } from 'react-router-dom';
import PageNotFound from '../../assets/img/PageNotFound.gif';

class NotFoundPage extends React.Component {
    render() {
        return (
            <div>
                <img src={PageNotFound} alt="404 Page Not Found"/>
                <p style={{ textAlign: "center" }}>
                    <Link to="/">Go to Home </Link>
                </p>
            </div>
        );
    }
}

export default NotFoundPage;