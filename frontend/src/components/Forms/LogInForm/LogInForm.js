import React from 'react';
import './LogInForm.css';
import PubSub from '../../../utils/pubsub';
import * as actionCreators from '../../../actions/auth'
import TextField from '@material-ui/core/TextField';
import { Redirect, Link } from "react-router-dom";

class LogInForm extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {
            redirect: null,
            email: "",
            emailError: "",
            password: "",
            passwordError: "",
        }
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
            <form onSubmit={this.props.onSubmit}>
                <h2>Log In</h2>
                <Link to={{pathname:"/register"}}>Sign Up</Link>
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
            </form>
        );
    }
}

export default LogInForm;