import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import TextField from '@material-ui/core/TextField';
import { StyledForgotPasswordForm } from './ForgotPasswordForm.styled';

class ForgotPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {
            email: "",
            emailError: "",
        }
    }
    forgotPassword() {
        PubSub.publish('loading', true);
        authQuery.resetPasswordRequest(this.state.email).then(response => {
            PubSub.publish('loading', false);
            this.props.history.replace('/')
        }).catch(error => {
            console.error(error);
            PubSub.publish('loading', false);
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
                <div className="form-header">
                    <h1 className="form-header-text">Forgot Password</h1>
                </div>
                <div className="form-body">
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
                        <button className="primary submit" type="submit" onClick={this.submit}>
                            Submit
       </button>
                    </div>
                </div>
            </StyledForgotPasswordForm>
        );
    }
}

ForgotPasswordForm.propTypes = {
    onSubmit: PropTypes.func,
    history: PropTypes.object,
}

export default withRouter(ForgotPasswordForm);