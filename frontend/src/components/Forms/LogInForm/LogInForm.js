import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import * as validation from 'utils/validations';
import TextField from 'components/shared/inputs/TextField/TextField';
import { StyledLogInForm } from './LogInForm.styled';

function LogInForm(props) {
    let history = useHistory();
    let ref = useRef({
        email: "",
        emailError: "",
        password: "",
        passwordError: "",
    })
    const [showErrors, setShowErrors] = useState(false);

    const toRegister = () => history.replace('/register');

    const toForgotPassword = () => history.replace('/forgot-password');

    const login = () => {
        PubSub.publish('loading', true);
        authQuery.loginUser(ref.current.email, ref.current.password).then(() => {
            PubSub.publish('loading', false);
            history.push('/profile');
        }).catch(error => {
            console.log("Failed to log in");
            console.error(error);
            PubSub.publish('loading', false);
            alert(error.error);
        })
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (!ref.current.emailError && !ref.current.passwordError) {
            login();
        }
    }

    const change = (name, value) => {
        ref.current[name] = value;
        console.log(ref.current[name])
    }

    return (
        <StyledLogInForm onSubmit={props.onSubmit}>
            <div className="form-header">
                <h1 className="form-header-text">Log In</h1>
                <h5 className="form-header-text"
                    onClick={toRegister}>&#8594;Sign Up</h5>
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
                <TextField
                    nameField="password"
                    errorField="passwordError"
                    type="password"
                    label="Password"
                    onChange={change}
                    validate={validation.passwordValidation}
                    showErrors={showErrors}
                />
                <div className="form-group">
                    <button className="primary submit" type="submit" onClick={submit}>
                        Submit
                    </button>
                </div>
                <h5 onClick={toForgotPassword}>Forgot Password?</h5>
            </div>
        </StyledLogInForm>
    );
}

LogInForm.propTypes = {
    onSubmit: PropTypes.func,
}

export default LogInForm;