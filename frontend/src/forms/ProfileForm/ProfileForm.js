import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useHistoryState } from 'utils/useHistoryState';
import PropTypes from 'prop-types';
import { profileSchema } from '@local/shared';
import { useGet, useMutate } from "restful-react";
import { BUSINESS_NAME, DEFAULT_PRONOUNS } from '@local/shared';
import { PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { Button, Container, FormLabel, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
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

function ProfileForm({
    user_id
}) {
    const classes = useStyles();
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

    let firstNameError = profileSchema.validateSyncAt('firstName', firstName);
    let lastNameError = profileSchema.validateSyncAt('lastName', lastName);
    let pronounsError = profileSchema.validateSyncAt('pronouns', pronouns);
    let businessError = profileSchema.validateSyncAt('businessName', business);
    let emailError = profileSchema.validateSyncAt('email', email);
    let phoneError = profileSchema.validateSyncAt('phone', phone);
    let currentPasswordError = profileSchema.validateSyncAt('currentPassword', currentPassword);
    let newPasswordError = profileSchema.validateSyncAt('newPassword', newPassword);
    let confirmPasswordError = newPassword === confirmPassword ? null : 'Passwords do not match';
    let formValid = (firstNameError || lastNameError || pronounsError || businessError || 
                     emailError || phoneError || currentPasswordError || newPasswordError || confirmPasswordError) === null;

    useGet({
        path: "profile",
        queryParams: { id: user_id },
        resolve: (response) => {
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
        }
    })

    const { mutate: updateProfile, loading } = useMutate({
        verb: 'PUT',
        path: 'profile',
        resolve: (response) => {
            if (response.ok) {
                PubSub.publish(PUBS.Snack, { message: 'Profile updated.' });
            }
            else {
                console.error(response.msg);
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error'})
            }
        }
    });

    useLayoutEffect(() => {
        document.title = `Profile | ${BUSINESS_NAME.Short}`;
    }, [])

    const toggleEdit = (event) => {
        event.preventDefault();
        setEditing(edit => !edit);
    }

    const submit = useCallback((event) => {
        event.preventDefault();
        let form = FormData(event.target);
        if (!profileSchema.isValidSync(form)) {
            PubSub.publish(PUBS.Snack, {message: 'Please fill in required fields.', severity: 'error'});
            return;
        }
        updateProfile(form);
    }, [fetched_profile, newPassword, confirmPassword, currentPassword, firstName, lastName, pronouns, email, phone, existingCustomer])

    const handleThemeSelect = (event) => {
        setTheme(event.target.value);
        PubSub.publish(PUBS.Theme, event.target.value);
    }

    const handleCustomerSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    const handleExtraEmailsSelect = (event) => {
        setExtraEmails(event.target.value);
    }

    return (
        <FormControl className={classes.form} error={!formValid}>
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
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            id="currentPassword"
                            autoComplete="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="newPassword"
                            label="New Password"
                            type="password"
                            id="newPassword"
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
                            id="confirmPassword"
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
    user_id: PropTypes.string.isRequired,
}

export default ProfileForm;