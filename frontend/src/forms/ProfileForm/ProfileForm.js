import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useHistoryState } from 'utils/useHistoryState';
import PropTypes from 'prop-types';
import * as validation from 'utils/validations';
import { getProfileInfo, updateProfile } from 'query/http_promises';
import { getSession, setTheme as storeTheme } from 'utils/storage';
import { BUSINESS_NAME, PUBS, DEFAULT_PRONOUNS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { Button, Container, FormLabel, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
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
    buttons: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
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
    const [theme, setTheme] = useState('light');
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
            PubSub.publish(PUBS.Snack, { message: 'Please enter your current password.', severity: 'error' });
            return;
        }
        // If the user is trying to update their password
        if (newPassword.length > 0 || confirmPassword.length > 0) {
            if (newPassword !== confirmPassword) {
                PubSub.publish(PUBS.Snack, { message: 'Confirm passwod does not match.', severity: 'error' });
                return;
            }
        }
        // If the user is trying to update their profile information TODO add checks for emails and phones
        if (firstName !== fetched_profile.firstName || lastName !== fetched_profile.lastName) {
            if (!validation.passedValidation(firstNameError, lastNameError, pronounsError, emailError, phoneError)) {
                PubSub.publish(PUBS.Snack, { message: 'Validation failed. Please check fields.', severity: 'error' });
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
            "theme": theme,
        }
        if (newPassword !== '')
            data.password = newPassword;
        updateProfile(session, data)
            .then(() => {
                PubSub.publish(PUBS.Snack, { message: 'Profile updated.' });
            })
            .catch(err => {
                console.error(err.msg);
                alert(err.msg);
            })
    }, [fetched_profile, newPassword, confirmPassword, currentPassword, firstName, lastName, pronouns, email, phone, existingCustomer])

    const handleThemeSelect = (event) => {
        setTheme(event.target.value);
        storeTheme(event.target.value);
    }

    const handleCustomerSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    const handleExtraEmailsSelect = (event) => {
        setExtraEmails(event.target.value);
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
                            <RadioGroup aria-label="theme-check" name="theme-check" value={theme} onChange={handleThemeSelect}>
                                <FormControlLabel value="light" control={<Radio />} label="Light ☀️" />
                                <FormControlLabel value="dark" control={<Radio />} label="Dark 🌙" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormControlLabel
                                required
                                control={
                                    <Checkbox
                                        checked={existingCustomer}
                                        onChange={handleCustomerSelect}
                                        name="existing-customer-check"
                                    />
                                }
                                label="I have ordered from New Life Nursery before"
                            />
                            <FormHelperText>{existingCustomerError}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Checkbox checked={extraEmails} value="allowExtraEmails" onChange={handleExtraEmailsSelect} />}
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
            <Grid className={classes.buttons} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Button fullWidth onClick={toggleEdit}>
                        {editing ? "Cancel" : "Edit"}
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button fullWidth type="submit" onClick={submit} disabled={!editing}>
                        Update
                 </Button>
                </Grid>
            </Grid>
        </FormControl>
    );
}

ProfileForm.propTypes = {
    session: PropTypes.object,
}

export default ProfileForm;