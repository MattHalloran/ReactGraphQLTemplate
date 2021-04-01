import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useHistoryState } from 'utils/useHistoryState';
import PropTypes from 'prop-types';
import * as validation from 'utils/validations';
import { getProfileInfo, updateProfile } from 'query/http_promises';
import { getSession, setTheme } from 'utils/storage';
import { BUSINESS_NAME, PUBS, DEFAULT_PRONOUNS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { Button, Container, FormLabel, Grid, TextField, Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
}));

function ProfileForm(props) {
    const classes = useStyles();
    const [session, setSession] = useState(getSession());
    const [editing, setEditing] = useState(false);
    const fetched_profile = useRef({});
    const [firstName, setFirstName] = useHistoryState("su_first_name", "");
    const [lastName, setLastName] = useHistoryState("su_last_name", "");
    const [pronouns, setPronouns] = useHistoryState("su_pronoun", DEFAULT_PRONOUNS[3]);
    const [business, setBusiness] = useHistoryState("su_bizz", null);
    const [email, setEmail] = useHistoryState("su_email", "");
    const email_id = useRef();
    const [phone, setPhone] = useHistoryState("su_phone", "");
    const phone_id = useRef();
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLightTheme, setIsLightTheme] = useState(null);
    const [existingCustomer, setExistingCustomer] = useHistoryState("su_existing", null);
    const [extraEmails, setExtraEmails] = useHistoryState("su_extra_email", null);

    let firstNameError = validation.firstNameValidation(firstName);
    let lastNameError = validation.lastNameValidation(lastName);
    let pronounsError = validation.pronounValidation(pronouns);
    let businessError = validation.businessValidation(business);
    let emailError = validation.emailValidation(email);
    let phoneError = validation.phoneNumberValidation(phone);
    let newPasswordError = validation.passwordValidation(newPassword);
    let confirmPasswordError = validation.confirmPasswordValidation(newPassword, confirmPassword);
    let existingCustomerError = '';
    let anyErrors = !validation.passedValidation(firstNameError, lastNameError, pronounsError, businessError,
        emailError, phoneError, newPasswordError, confirmPasswordError, existingCustomerError);


    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return () => PubSub.unsubscribe(sessionSub);
    }, [])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = `Profile | ${BUSINESS_NAME.Short}`;
        if (!session) return;
        getProfileInfo(session, session.tag).then(response => {
            if (!mounted || editing) return;
            let user = response.user;
            fetched_profile.current = user;
            if (user.first_name) setFirstName(user.first_name);
            if (user.last_name) setLastName(user.last_name)
            // TODO convert emails and phones to strings first
            if (user.emails) {
                setEmail(user.emails[0].email_address);
                email_id.current = user.emails[0].id
            }
            if (user.phones) {
                setPhone(user.phones[0].unformatted_number);
                phone_id.current = user.phones[0].id
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
        // If the user did not enter their current password, they cannot change anything
        if (currentPassword.length === 0) {
            alert('Please enter your current password');
            return;
        }
        // If the user is trying to update their password
        if (newPassword.length > 0 || confirmPassword.length > 0) {
            if (newPassword !== confirmPassword) {
                alert('New password and confirm password do not match!')
                return;
            }
        }
        // If the user is trying to update their profile information TODO add checks for emails and phones
        if (firstName !== fetched_profile.firstName || lastName !== fetched_profile.lastName) {
            if (!validation.passedValidation(firstNameError, lastNameError, pronounsError, emailError, phoneError)) {
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
            "emails": [{ "id": email_id.current, "email_address": email, "receives_delivery_updates": true }],
            // "phones": [{
            //     "id": phone_ids.current[0],
            //     "unformatted_number": phones[0] ?? 'N/A',
            //      "country_code": '+1',
            //      "extension": '',
            //      "is_mobile": true,
            //      "receives_delivery_updates": false
            // }],
            "existing_customer": existingCustomer,
            "theme": isLightTheme ? 'light' : 'dark',
        }
        if (newPassword !== '')
            data.password = newPassword;
        updateProfile(session, data)
            .then(() => {
                alert('Profile updated!');
            })
            .catch(err => {
                console.error(err.msg);
                alert(err.msg);
            })
    }, [fetched_profile, newPassword, confirmPassword, currentPassword, firstName, lastName, pronouns, email, phone, existingCustomer])

    const handleThemeSelect = (event) => {
        setIsLightTheme(event.target.value == 'true');
        setTheme(event.target.value === 'true' ? 'light' : 'dark');
    }

    const handleCustomerSelect = (event) => {
        setExistingCustomer(event.target.value == 'true');
    }

    const handleExtraEmailsSelect = (event) => {
        setExtraEmails(event.target.value == 'true');
    }

    return (
        <FormControl className={classes.form} error={anyErrors}>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoComplete="fname"
                            name="firstName"
                            required
                            fullWidth
                            id="firstName"
                            label="First Name"
                            autoFocus
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            error={firstNameError !== null}
                            helperText={firstNameError}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            autoComplete="lname"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            error={lastNameError !== null}
                            helperText={lastNameError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="pronouns"
                            label="Pronouns"
                            name="pronouns"
                            autoComplete="pronouns"
                            defaultValue={DEFAULT_PRONOUNS[3]}
                            value={pronouns}
                            onChange={e => setPronouns(e.target.value)}
                            error={pronounsError !== null}
                            helperText={pronounsError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="business"
                            label="Business"
                            name="business"
                            autoComplete="business"
                            value={business}
                            onChange={e => setBusiness(e.target.value)}
                            error={businessError !== null}
                            helperText={businessError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            error={emailError !== null}
                            helperText={emailError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="phone"
                            label="Phone Number"
                            name="phone"
                            autoComplete="phone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            error={phoneError !== null}
                            helperText={phoneError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Theme</FormLabel>
                            <RadioGroup aria-label="theme-check" name="theme-check" value={isLightTheme} onChange={handleThemeSelect}>
                                <FormControlLabel value="true" control={<Radio />} label="Light" />
                                <FormControlLabel value="false" control={<Radio />} label="Dark" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={existingCustomer} onChange={handleCustomerSelect}>
                                <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                                <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                            </RadioGroup>
                            <FormHelperText>{existingCustomerError}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Checkbox value="allowExtraEmails" color="primary" onChange={handleExtraEmailsSelect} />}
                            label="I want to receive marketing promotions and updates via email."
                        />
                    </Grid>
                </Grid>
            </Container>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="current-password"
                            label="Current Password"
                            type="password"
                            id="current-password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="new-password"
                            label="New Password"
                            type="password"
                            id="new-password"
                            autoComplete="current-password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            error={newPasswordError !== null}
                            helperText={newPasswordError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirm-password"
                            autoComplete="current-password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </Container>
            <div>
                <Button onClick={toggleEdit}>
                    {editing ? "Cancel" : "Edit"}
                </Button>
                <Button type="submit" onClick={submit} disabled={!editing}>
                    Update
                 </Button>
            </div>
        </FormControl>
    );
}

ProfileForm.propTypes = {
    session: PropTypes.object,
}

export default ProfileForm;