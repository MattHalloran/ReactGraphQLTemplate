import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import PropTypes from 'prop-types';
import InputText from 'components/inputs/InputText/InputText';
import * as validation from 'utils/validations';
import { getProfileInfo, updateProfile } from 'query/http_promises';
import { getSession } from 'utils/storage';
import { BUSINESS_NAME, PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import Button from 'components/Button/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

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
    const fetched_profile = useRef({});
    const [session, setSession] = useState(getSession());
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
    const [currentPassword, setCurrentPassword] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("")
    // Array profile fields
    const [emails, setEmails] = useState([""])
    const [emailErrors, setEmailErrors] = useState(null);
    const [phones, setPhones] = useState([""])
    const [phoneErrors, setPhoneErrors] = useState(null);
    const [existingCustomer, setExistingCustomer] = useState(null);
    const [existingCustomerError, setExistingCustomerError] = useState(null);

    useEffect(() => {
        console.log('PRONOUNS ARE', pronouns)
    }, [pronouns])

    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return () => PubSub.unsubscribe(sessionSub);
    }, [])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = `Profile | ${BUSINESS_NAME}`;
        if (!session) return;
        getProfileInfo(session).then(response => {
            console.log('GOT PROFILE INFOO!!!!!!', response);
            if (!mounted || editing) return;
            let user = response.user;
            fetched_profile.current = user;
            if (user.first_name) setFirstName(user.first_name);
            if (user.last_name) setLastName(user.last_name)
            // TODO convert emails and phones to strings first
            if (user.emails) {
                setEmails(user.emails.map(o => o.email_address));
            }
            if (user.phones) {
                setPhones(user.phones.map(o => o.unformatted_number));
            }
            if (user.pronouns) {
                setPronouns(user.pronouns);
            }
        }).catch(err => {
            console.error(err);
        })
        return () => mounted = false;
    }, [])

    const toggleEdit = (event) => {
        event.preventDefault();
        setEditing(edit => !edit);
    }

    const submit = useCallback((event) => {
        event.preventDefault();
        setShowErrors(true);
        // If the user did not enter their current password, they cannot change anything
        if (currentPassword.length === 0) {
            alert('Please enter your current password');
            return;
        }
        // If the user is trying to update their password
        if (password.length > 0 || confirmPassword.length > 0) {
            if (password !== confirmPassword) {
                alert('New password and confirm password do not match!')
                return;
            }
        }
        // If the user is trying to update their profile information TODO add checks for emails and phones
        if (firstName !== fetched_profile.firstName || lastName !== fetched_profile.lastName) {
            if (!validation.passedValidation(firstNameError, lastNameError, pronounsError, emailErrors, phoneErrors)) {
                alert('Validation failed! Please check fields');
                return;
            }

        }
        // Now that all checks have passed, we can send post a profile update
        let data = {
            "currentPassword": currentPassword,
            "first_name": firstName,
            "last_name": lastName,
            "pronouns": pronouns,
            "emails": emails,
            "phones": phones,
            "existing_customer": existingCustomer
        }
        if (password !== '')
            data.password = password;
        updateProfile(session, data)
            .then(() => {
                alert('Profile updated!');
            })
            .catch(err => {
                console.error(err.msg);
                alert(err.msg);
            })
    }, [fetched_profile, password, confirmPassword, currentPassword, firstName, lastName, pronouns, emails, phones, existingCustomer])

    // Helper method for updating InputText objects created through a map
    const updateFieldArray = (stateFunc, value, index) => {
        console.log('TODO')
    }

    const handleRadioSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    return (
        <React.Fragment>
            <div id="profile-image-div">
            </div>
            {/* Main profile info section */}
            <div className="half">
                <h4>Update Profile Info</h4>
                <InputText
                    label="First Name"
                    type="text"
                    value={firstName}
                    valueFunc={setFirstName}
                    error={firstNameError}
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
                    error={lastNameError}
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
                    error={pronounsError}
                    errorFunc={setPronounsError}
                    validate={validation.pronounValidation}
                    showErrors={showErrors}
                    disabled={!editing}
                />
                {emails.map((email, index) => (
                    <InputText
                        index={index}
                        label={`Email #${index + 1}`}
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
                        label={`Phone #${index + 1}`}
                        type="text"
                        value={phone}
                        valueFunc={(v, i) => updateFieldArray(setPhones, v, i)}
                        errorFunc={(v, i) => updateFieldArray(setPhoneErrors, v, i)}
                        validate={validation.pronounValidation}
                        showErrors={showErrors}
                        disabled={!editing}
                    />
                ))}
                <FormControl component="fieldset">
                    <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={existingCustomer} onChange={handleRadioSelect}>
                        <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                        <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                    </RadioGroup>
                    <FormHelperText>{existingCustomerError}</FormHelperText>
                </FormControl>
            </div>
            {/* Change password section */}
            <div className="half">
                <h4>Update Password</h4>
                <InputText
                    label="New Password"
                    type="password"
                    value={password}
                    valueFunc={setPassword}
                    error={passwordError}
                    errorFunc={setPasswordError}
                    validate={validation.passwordValidation}
                    showErrors={showErrors}
                    disabled={!editing}
                />
                <InputText
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    valueFunc={setConfirmPassword}
                    disabled={!editing}
                />
            </div>
            <div className="buttons-div">
                <InputText
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    valueFunc={setCurrentPassword}
                    disabled={!editing}
                />
                <Button className="primary" onClick={toggleEdit}>
                    {editing ? "Cancel" : "Edit"}
                </Button>
                <Button className="primary" type="submit" onClick={submit} disabled={!editing}>
                    Update
                </Button>
            </div>
        </React.Fragment>
    );
}

ProfileForm.propTypes = {
    session: PropTypes.object,
}

export default ProfileForm;