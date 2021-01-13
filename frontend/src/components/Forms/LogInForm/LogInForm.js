import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import PubSub from 'utils/pubsub';
import * as authQuery from 'query/auth';
import * as validation from 'utils/validations';
import InputText from 'components/shared/inputs/InputText/InputText';
import { PUBS, LINKS } from 'consts';

function LogInForm() {
    let history = useHistory();
    const [email, setEmail] = useHistoryState("li_email", "");
    const [emailError, setEmailError] = useHistoryState("li_email_error", null);
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState(null);
    const [showErrors, setShowErrors] = useState(false);

    const toRegister = () => history.replace('/register');

    const toForgotPassword = () => history.replace('/forgot-password');

    const login = () => {
        PubSub.publish(PUBS.Loading, true);
        authQuery.loginUser(email, password).then(() => {
            PubSub.publish(PUBS.Loading, false);
            history.push(LINKS.Profile);
        }).catch(error => {
            console.log("Failed to log in");
            console.error(error);
            PubSub.publish(PUBS.Loading, false);
            alert(error.error);
        })
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (!emailError && !passwordError) login();
    }

    return (
        <React.Fragment>
            <InputText
                label="Email"
                type="email"
                value={email}
                valueFunc={setEmail}
                errorFunc={setEmailError}
                validate={validation.emailValidation}
                showErrors={showErrors}
            />
            <InputText
                label="Password"
                type="password"
                valueFunc={setPassword}
                errorFunc={setPasswordError}
                validate={validation.passwordValidation}
                showErrors={showErrors}
            />
            <button className="primary submit" type="submit" onClick={submit}>
                Submit
            </button>
            <h5 className="form-header-text"
                onClick={toRegister}>&#8594;Sign Up</h5>
            <h5 onClick={toForgotPassword}>Forgot Password?</h5>
        </React.Fragment>
    );
}

LogInForm.propTypes = {

}

export default LogInForm;