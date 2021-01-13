import React, { useEffect, useState } from 'react'
import InputText from 'components/shared/inputs/InputText/InputText';
import * as validation from 'utils/validations';
import { BUSINESS_NAME } from 'consts';

function ProfileForm() {
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState("")
    const [firstNameError, setFirstNameError] = useState(null);
    const [lastName, setLastName] = useState("")
    const [lastNameError, setLastNameError] = useState(null);
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState(null);
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [phoneError, setPhoneError] = useState(null);
    const [address, setAddress] = useState("")
    const [addressError, setAddressError] = useState(null);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        document.title = `Profile | ${BUSINESS_NAME}`;
    }, [])

    const updateProfile = () => {
        console.log('TODO!!!')
    }

    const toggleEdit = (event) => {
        event.preventDefault();
        setEditing(edit => !edit);
    }

    const submit = (event) => {
        event.preventDefault();
        setShowErrors(true);
        if (!firstNameError && !lastNameError && !emailError &&
            !phoneError && !addressError && !passwordError && password === confirmPassword) {
            updateProfile();
        }
    }

    return (
        <React.Fragment>
            <div id="profile-image-div">
            </div>
            <InputText
                label="First Name"
                type="text"
                value={firstName}
                valueFunc={setFirstName}
                errorFunc={setFirstNameError}
                validate={validation.firstNameValidation}
                showErrors={showErrors}
                autocomplete="John"
                disabled={!editing}
            />
            <InputText
                label="Last Name"
                type="text"
                value={lastName}
                valueFunc={setLastName}
                errorFunc={setLastNameError}
                validate={validation.lastNameValidation}
                showErrors={showErrors}
                autocomplete="Doe"
                disabled={!editing}
            />
            <InputText
                label="Email"
                type="email"
                value={email}
                valueFunc={setEmail}
                errorFunc={setEmailError}
                validate={validation.emailValidation}
                showErrors={showErrors}
                autocomplete="john.doe@gmail.com"
                disabled={!editing}
            />
            <InputText
                label="Phone Number"
                type="text"
                value={phone}
                valueFunc={setPhone}
                errorFunc={setPhoneError}
                validate={validation.phoneNumberValidation}
                showErrors={showErrors}
                autocomplete="555-867-5309"
                disabled={!editing}
            />
            <InputText
                label="Delivery Address"
                type="text"
                value={address}
                valueFunc={setAddress}
                errorFunc={setAddressError}
                validate={validation.addressValidation}
                showErrors={showErrors}
                autocomplete="123 Fake Street Philadelphia PA"
                disabled={!editing}
            />
            <InputText
                label="Password"
                type="password"
                value={password}
                valueFunc={setPassword}
                errorFunc={setPasswordError}
                validate={validation.passwordValidation}
                showErrors={showErrors}
                disabled={!editing}
            />
            <InputText
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                valueFunc={setConfirmPassword}
                disabled={!editing}
            />
            <div className="buttons-div">
                <button className="primary" onClick={toggleEdit}>
                    { editing ? "Cancel" : "Edit" }
            </button>
                <button className="primary" type="submit" onClick={submit}>
                    Submit
            </button>
            </div>
        </React.Fragment>
    );
}

ProfileForm.propTypes = {

}

export default ProfileForm;