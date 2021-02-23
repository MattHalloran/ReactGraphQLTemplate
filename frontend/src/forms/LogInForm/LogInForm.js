import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import { loginUser } from 'query/http_promises';
import * as validation from 'utils/validations';
import InputText from 'components/inputs/InputText/InputText';
import { LINKS } from 'utils/consts';
import Button from 'components/Button/Button';

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
        loginUser(email, password).then(() => {
            history.push(LINKS.Shopping);
        }).catch(error => {
            console.log("Failed to log in");
            console.error(error);
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
            {/* I kid you not, the autofill will not work correctly if this isn't here */}
            <InputText
                style={{visibility:'hidden',display:'none'}}
                label="Email"
                type="email"
                value={email}
                valueFunc={setEmail}
                errorFunc={setEmailError}
                validate={validation.emailValidation}
                showErrors={showErrors}
            />
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
                validate={validation.defaultStringValidation}
                showErrors={showErrors}
            />
            <Button className="primary submit" type="submit" onClick={submit}>
                Submit
            </Button>
            <h5 className="form-header-text"
                onClick={toRegister}>&#8594;Sign Up</h5>
            <h5 onClick={toForgotPassword}>Forgot Password?</h5>
        </React.Fragment>
    );
}

LogInForm.propTypes = {

}

export default LogInForm;