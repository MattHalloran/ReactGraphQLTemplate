import React from 'react';
import PropTypes from 'prop-types';
import PubSub from '../../../utils/pubsub';
import * as actionCreators from '../../../actions/auth'
import TextField from '@material-ui/core/TextField';
import { Link } from "react-router-dom";
import { StyledLogInForm } from './LogInForm.styled';

class LogInForm extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.toRegister = this.toRegister.bind(this);
        this.state = {
            redirect: null,
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
        PubSub.publish('Loading', true);
        actionCreators.loginUser(this.state.email, this.state.password).then(response => {
            PubSub.publish('Loading', false);
          this.setState({ redirect: '/profile' });
        }).catch(error => {
            console.log("Failed to log in");
            console.error(error);
            PubSub.publish('Loading', false);
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
                <h2>Log In</h2>
                <h5 onClick={this.toRegister}>Sign Up</h5>
                <TextField
                    name="email"
                    className="form-input"
                    type="email"
                    variant="outlined"
                    label="Email"
                    value={this.state.email}
                    onChange={e => this.change(e)}
                    error={this.state.emailError.length > 0}
                    helperText={this.state.emailError}
                    required
                />
                <TextField
                    name="password"
                    className="form-input"
                    type="password"
                    variant="outlined"
                    label="Password"
                    value={this.state.password}
                    onChange={e => this.change(e)}
                    error={this.state.passwordError.length > 0}
                    helperText={this.state.passwordError}
                    required
                />
                <div className="form-group">
                    <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
                        Submit
       </button>
                </div>
                <Link to={{pathname:"/forgot-password"}}>Forgot Password?</Link>
            </StyledLogInForm>
        );
    }
}

LogInForm.propTypes = {
    onSubmit: PropTypes.func,
    history: PropTypes.object,
}

export default LogInForm;