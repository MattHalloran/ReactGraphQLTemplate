import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import TextField from 'components/shared/inputs/TextField';
import { Link } from "react-router-dom";
import { StyledLogInForm } from './LogInForm.styled';

class LogInForm extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.toRegister = this.toRegister.bind(this);
        this.state = {
            email: "",
            emailError: "",
            password: "",
            passwordError: "",
        }
    }
    toRegister() {
        this.props.history.replace('/register');
    }
    login() {
        PubSub.publish('loading', true);
        authQuery.loginUser(this.state.email, this.state.password).then(response => {
            PubSub.publish('loading', false);
            this.props.history.push('/profile');
        }).catch(error => {
            console.log("Failed to log in");
            console.error(error);
            PubSub.publish('loading', false);
            alert(error.error);
        })
    }
    submit(event) {
        event.preventDefault();
        if (this.validate()) {
            this.login();
        }
    }
    change = e => {
        console.log('IN CHANGEEEEE', e.target, this.state.email);
        this.setState({ [e.target.name]: e.target.value });
    }
    validate() {
        let isError = false;
        const errors = {
            emailError: "",
            passwordError: ""
        }

        if (this.state.email.length === 0) {
            isError = true;
            errors.emailError = "Must enter email"
        }

        if (this.state.password.length === 0) {
            isError = true;
            errors.passwordError = "Must enter password"
        }

        this.setState({
            ...this.state,
            ...errors
        });

        return !isError
    }
    render() {
        return (
            <StyledLogInForm onSubmit={this.props.onSubmit}>
                <div className="form-header">
                    <h1 className="form-header-text">Log In</h1>
                    <h5 className="form-header-text"
                        onClick={this.toRegister}>&#8594;Sign Up</h5>
                </div>
                <div className="form-body">
                    <TextField
                        name="email"
                        type="email"
                        label="Email"
                        autocomplete="username"
                        value={this.state.email}
                        onChange={e => this.change(e)}
                        error={this.state.emailError}
                    />
                    <TextField
                        name="password"
                        type="password"
                        label="Password"
                        autoComplete="current-password"
                        value={this.state.password}
                        onChange={e => this.change(e)}
                        error={this.state.passwordError}
                    />
                    <div className="form-group">
                        <button className="primary submit" type="submit" onClick={this.submit}>
                            Submit
                        </button>
                    </div>
                    <Link to={{ pathname: "/forgot-password" }}>Forgot Password?</Link>
                </div>
            </StyledLogInForm>
        );
    }
}

LogInForm.propTypes = {
    onSubmit: PropTypes.func,
    history: PropTypes.object,
}

export default withRouter(LogInForm);