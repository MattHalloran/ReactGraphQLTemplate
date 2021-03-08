import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser } from 'query/http_promises';
import * as validation from 'utils/validations';
import InputText from 'components/inputs/InputText/InputText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { useHistoryState } from 'utils/useHistoryState';
import { LINKS, DEFAULT_PRONOUNS, STATUS_CODES } from 'utils/consts';
import Button from 'components/Button/Button';

function SignUpForm() {
    let history = useHistory();
    const [firstName, setFirstName] = useHistoryState("su_first_name", "");
    const [firstNameError, setFirstNameError] = useHistoryState("su_first_name_error", null);
    const [lastName, setLastName] = useHistoryState("su_last_name", "");
    const [lastNameError, setLastNameError] = useHistoryState("su_last_name_error", null);
    const [pronouns, setPronouns] = useHistoryState("su_pronoun", DEFAULT_PRONOUNS[3]);
    const [pronounsError, setPronounsError] = useHistoryState("su_pronoun_error", null);
    const [business, setBusiness] = useHistoryState("su_bizz", null);
    const [businessError, setBusinessError] = useHistoryState("su_bizz_error", null);
    const [email, setEmail] = useHistoryState("su_email", "");
    const [emailError, setEmailError] = useHistoryState("su_email_error", null);
    const [phone, setPhone] = useHistoryState("su_phone", "");
    const [phoneError, setPhoneError] = useHistoryState("su_phone_error", null);
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [existingCustomer, setExistingCustomer] = useHistoryState("su_existing", null);
    const [existingCustomerError, setExistingCustomerError] = useHistoryState("su_existing_error", null);
    const [showErrors, setShowErrors] = useState(false);

    const toLogin = () => {
        history.replace('/login');
    }

    const register = () => {
        let data = {
            "first_name": firstName,
            "last_name": lastName,
            "pronouns": pronouns,
            "business": business,
            "emails": [{"email_address": email, "receives_delivery_updates": true}],
            "phones": [{
                "unformatted_number": phone,
                 "country_code": '+1',
                 "extension": '',
                 "is_mobile": true,
                 "receives_delivery_updates": false
            }],
            "password": password,
            "existing_customer": existingCustomer
        }
        console.log('DATA ISSSSSS', data);
        registerUser(data).then(() => {
            if (existingCustomer) {
                alert('Welcome to New Life Nursery! You may now begin shopping');
            } else {
                alert('Welcome to New Life Nursery! Since you have never ordered from us before, we must approve your account before you can order. If this was a mistake, you can edit this in the /profile page');
            }
            history.push(LINKS.Shopping);
        }).catch(err => {
            console.error(err);
            if (err.code === STATUS_CODES.FAILURE_EMAIL_EXISTS.code) {
                if (window.confirm(`${err.msg}. Press OK if you would like to be redirected to the forgot password form`)) {
                    history.push(LINKS.ForgotPassword);
                }
            } else {
                alert(err.msg);
            }
        })
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if (!validation.passedValidation(firstNameError, lastNameError, pronounsError, businessError, emailError,
            passwordError, existingCustomerError)) {
            alert('Please fill in required fields');
            return;

        }
        register();
    }

    const handleRadioSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    return (
        <React.Fragment>
            <div className="horizontal-input-container">
                <InputText
                    label="First Name"
                    type="text"
                    value={firstName}
                    valueFunc={setFirstName}
                    error={firstNameError}
                    errorFunc={setFirstNameError}
                    validate={validation.firstNameValidation}
                    showErrors={showErrors}
                />
                <InputText
                    label="Last Name"
                    type="text"
                    value={lastName}
                    valueFunc={setLastName}
                    error={lastNameError}
                    errorFunc={setLastNameError}
                    validate={validation.lastNameValidation}
                    showErrors={showErrors}
                />
            </div>
            <InputText
                label="Pronouns"
                value={pronouns}
                valueFunc={setPronouns}
                error={pronounsError}
                errorFunc={setPronounsError}
                validate={validation.pronounValidation}>
            </InputText>
            <InputText
                label="Business"
                type="text"
                value={business}
                valueFunc={setBusiness}
                error={businessError}
                errorFunc={setBusinessError}
                validate={validation.businessValidation}
                showErrors={showErrors}
            />
            <InputText
                label="Email"
                type="email"
                value={email}
                valueFunc={setEmail}
                error={emailError}
                errorFunc={setEmailError}
                validate={validation.emailValidation}
                showErrors={showErrors}
            />
            <InputText
                label="Phone"
                type="text"
                value={phone}
                valueFunc={setPhone}
                error={phoneError}
                errorFunc={setPhoneError}
                validate={validation.phoneNumberValidation}
                showErrors={showErrors}
            />
            <InputText
                label="Password"
                type="password"
                value={password}
                valueFunc={setPassword}
                error={passwordError}
                errorFunc={setPasswordError}
                validate={validation.passwordValidation}
                showErrors={showErrors}
            />
            <InputText
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                valueFunc={setConfirmPassword}
            />
            <FormControl component="fieldset">
                <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={existingCustomer} onChange={handleRadioSelect}>
                    <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                    <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                </RadioGroup>
                <FormHelperText>{existingCustomerError}</FormHelperText>
            </FormControl>
            <div className="form-group">
                <Button className="primary submit" type="submit" onClick={submit}>
                    Submit
     </Button>
                <h5 className="form-header-text"
                    onClick={toLogin}>&#8594;Log In</h5>
            </div>
        </React.Fragment>
    );
}

SignUpForm.propTypes = {

}

export default SignUpForm;