import React, { useEffect, useState, useLayoutEffect } from 'react'
import PropTypes from 'prop-types';
import InputText from 'components/inputs/InputText/InputText';
import * as validation from 'utils/validations';
import { getProfileInfo } from 'query/http_promises';
import { BUSINESS_NAME } from 'utils/consts';
import Button from 'components/Button/Button';

// Profile fields:
// first_name: str
// last_name: str
// image_file: object
// pronouns: str
// theme: str
// personal_email: array
// personal_phone: array
// orders: array (last order is cart)
function ProfileForm(props) {
    const [editing, setEditing] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    // String profile fields
    const [picSrc, setPicSrc] = useState(null);
    const [firstName, setFirstName] = useState("")
    const [firstNameError, setFirstNameError] = useState(null);
    const [lastName, setLastName] = useState("")
    const [lastNameError, setLastNameError] = useState(null);
    const [pronouns, setPronouns] = useState("")
    const [pronounsError, setPronounsError] = useState(null);
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("")
    // Array profile fields
    const [emails, setEmails] = useState([""])
    const [emailErrors, setEmailErrors] = useState(null);
    const [phones, setPhones] = useState([""])
    const [phoneErrors, setPhoneErrors] = useState(null);

    useEffect(() => {
        console.log('PRONOUNS ARE', pronouns)
    }, [pronouns])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = `Profile | ${BUSINESS_NAME}`;
        if (props.session) {
            getProfileInfo(props.session).then(response => {
                console.log('GOT PROFILE INFOO!!!!!!', response);
                if (!mounted || editing) return;
                if (response.first_name) setFirstName(response.first_name);
                if (response.last_name) setLastName(response.last_name)
                // TODO convert emails and phones to strings first
                if (response.personal_email) {
                    setEmails(response.personal_email.map(o => o.email_address));
                }
                if (response.personal_phone) {
                    setPhones(response.personal_phone.map(o => o.unformatted_number));
                }
                if (response.pronouns) {
                    setPronouns(response.pronouns);
                }
            }).catch(err => {
                console.error(err);
            })
        }
        return () => mounted = false;
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
        if (validation.passwordValidation(firstNameError, lastNameError, pronounsError, 
            passwordError, emailErrors, phoneErrors) && !passwordError && password === confirmPassword) {
            updateProfile();
        }
    }

    // Helper method for updating InputText objects created through a map
    const updateFieldArray = (stateFunc, value, index) => {
        console.log('TODO')
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
            label="Pronouns"
            type="text"
            value={pronouns}
            valueFunc={setPronouns}
            errorFunc={setPronounsError}
            validate={validation.pronounValidation}
            showErrors={showErrors}
            disabled={!editing}
          />
      {emails.map((email, index) => (
          <InputText
          index={index}
          label={`Email #${index+1}`}
          type="text"
          value={email}
          valueFunc={(v, i) => updateFieldArray(setEmails, v, i)}
          errorFunc={(v, i) => updateFieldArray(setEmailErrors, v, i)}
          validate={validation.pronounValidation}
          showErrors={showErrors}
          disabled={!editing}
        />
      ))}
      {phones.map((phone, index) => (
          <InputText
          index={index}
          label={`Phone #${index+1}`}
          type="text"
          value={phone}
          valueFunc={(v, i) => updateFieldArray(setPhones, v, i)}
          errorFunc={(v, i) => updateFieldArray(setPhoneErrors, v, i)}
          validate={validation.pronounValidation}
          showErrors={showErrors}
          disabled={!editing}
        />
      ))}
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
                <Button className="primary" onClick={toggleEdit}>
                    { editing ? "Cancel" : "Edit" }
            </Button>
                <Button className="primary" type="submit" onClick={submit}>
                    Submit
            </Button>
            </div>
        </React.Fragment>
    );
}

ProfileForm.propTypes = {
    session: PropTypes.object,
}

export default ProfileForm;