import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import * as validation from 'utils/validations';
import TextField from 'components/shared/inputs/TextField/TextField';
import { StyledForgotPasswordForm } from './ForgotPasswordForm.styled';

function ForgotPasswordForm(props) {
    let history = useHistory();
    let ref = useRef({
        email: "",
        emailError: "",
    })
    const [showErrors, setShowErrors] = useState(false);

    const forgotPassword = () => {
        PubSub.publish('loading', true);
        authQuery.resetPasswordRequest(ref.current.email).then(() => {
            PubSub.publish('loading', false);
            history.replace('/');
        }).catch(error => {
            console.error(error);
            PubSub.publish('loading', false);
        })
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (!ref.current.emailError) {
            forgotPassword();
        }
    }

    const change = (name, value) => {
        ref.current[name] = value;
        console.log('BUTTTT', ref.current);
    }

    return (
        <StyledForgotPasswordForm onSubmit={props.onSubmit}>
            <div className="form-header">
                <h1 className="form-header-text">Forgot Password</h1>
            </div>
            <div className="form-body">
                <TextField
                    nameField="email"
                    errorField="emailError"
                    type="email"
                    label="Email"
                    onChange={change}
                    validate={validation.emailValidation}
                    showErrors={showErrors}
                />
                <div className="form-group">
                    <button className="primary submit" type="submit" onClick={submit}>
                        Submit
                    </button>
                </div>
            </div>
        </StyledForgotPasswordForm>
    );
}

ForgotPasswordForm.propTypes = {
    onSubmit: PropTypes.func,
}

export default ForgotPasswordForm;