import React from 'react';
import PubSub from '../../../utils/pubsub';
import * as actionCreators from '../../../actions/auth'
import TextField from '@material-ui/core/TextField';
import { Redirect, Link } from "react-router-dom";
import { StyledForgotPasswordForm } from './ForgotPasswordForm.styled';

class ForgotPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {
            redirect: null,
            email: "",
            emailError: "",
        }
    }
    forgotPassword() {
        PubSub.publish('Loading', true);
        actionCreators.resetPasswordRequest(this.state.email).then(response => {
            PubSub.publish('Loading', false);
          this.setState({ redirect: '/' });
        }).catch(error => {
          console.error(error);
          PubSub.publish('Loading', false);
        })
    }
    submit(event) {
        event.preventDefault();
        if (this.validate()) {
            this.forgotPassword();
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

        this.setState({
            ...this.state,
            ...errors
        });

        return !isError
    }
    render() {
        return (
            <StyledForgotPasswordForm onSubmit={this.props.onSubmit}>
                <h2>Log In</h2>
                <Link to={{ pathname: "/register" }}>Sign Up</Link>
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
                <div className="form-group">
                    <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
                        Submit
       </button>
                </div>
            </StyledForgotPasswordForm>
        );
    }
}

export default ForgotPasswordForm;