import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import Container from '../Modal/Container/Container';
import {Burger,Menu} from '../../components';

class Navbar extends React.Component {
    render() {
        const onSignUpSubmit = (event) => {
            event.preventDefault(event);
        };
        const onLogInSubmit = (event) => {
            event.preventDefault(event);
        }
        return (
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        New Life Nursery
                    </Link>
                    <Burger/>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarResponsive">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Container triggerText="Sign Up" signUp={true} onSubmit={onSignUpSubmit} class="nav-link" href="#"/>
                            </li>
                            <li className="nav-item">
                                <Container triggerText="Log In" signUp={false} onSubmit={onLogInSubmit} class="nav-link" href="#" />
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;