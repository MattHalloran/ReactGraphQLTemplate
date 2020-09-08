import React from 'react';
import {Link} from 'react-router-dom';

class Navbar extends React.Component{
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
                <div className="container">
                <Link to="/">
                <a className="navbar-brand" href="#">Start Bootstrap</a>
                </Link>
                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link to="/signup">
                        <a className="nav-link" href="#">Sign Up</a>
                        </Link>
                        
                    </li>
                    <li className="nav-item">
                        <Link to="login">
                        <a className="nav-link" href="#">Log In</a>
                        </Link>
                        
                    </li>
                    </ul>
                </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;