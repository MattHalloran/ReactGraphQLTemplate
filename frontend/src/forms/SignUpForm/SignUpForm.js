import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import { signUpSchema } from '@local/shared';
import { Button, TextField, Checkbox, Link } from '@material-ui/core';
import { FormControl, FormControlLabel, FormHelperText, Grid, RadioGroup, Radio, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CODE, DEFAULT_PRONOUNS } from '@local/shared';
import { LINKS, PUBS } from 'utils/consts';
import { useMutate } from "restful-react";
import PubSub from 'utils/pubsub';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function SignUpForm({
    onSessionUpdate,
    onRedirect
}) {
    let history = useHistory();
    const classes = useStyles();
    const [firstName, setFirstName] = useHistoryState("su_first_name", "");
    const [lastName, setLastName] = useHistoryState("su_last_name", "");
    const [pronouns, setPronouns] = useHistoryState("su_pronoun", DEFAULT_PRONOUNS[3]);
    const [business, setBusiness] = useHistoryState("su_bizz", null);
    const [email, setEmail] = useHistoryState("su_email", "");
    const [phone, setPhone] = useHistoryState("su_phone", "");
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");
    const [existingCustomer, setExistingCustomer] = useHistoryState("su_existing", null);

    let firstNameError = signUpSchema.validateSyncAt('firstName', firstName);
    let lastNameError = signUpSchema.validateSyncAt('lastName', lastName);
    let pronounsError = signUpSchema.validateSyncAt('pronouns', pronouns);
    let businessError = signUpSchema.validateSyncAt('businessName', business);
    let emailError = signUpSchema.validateSyncAt('email', email);
    let phoneError = signUpSchema.validateSyncAt('phone', phone);
    let passwordError = signUpSchema.validateSyncAt('password', password);
    let confirmPasswordError = password === confirmPassword ? null : 'Passwords do not match';
    let formValid = (firstNameError || lastNameError || pronounsError || businessError || 
                     emailError || phoneError || passwordError || confirmPasswordError) === null;

    const handleCheckbox = (event) => {
        console.log('TODO')
    }

    const handleRadioSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    const { mutate: registerUser } = useMutate({
        verb: 'POST',
        path: 'register',
        resolve: (response) => {
            if (response.ok) {
                onSessionUpdate(response.session);
                if (existingCustomer) {
                    alert('Welcome to New Life Nursery! You may now begin shopping. Please verify your email within 48 hours.');
                } else {
                    alert('Welcome to New Life Nursery! Since you have never ordered from us before, we must approve your account before you can order. If this was a mistake, you can edit this in the /profile page');
                }
                onRedirect(LINKS.Shopping);
            }
            else {
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
                if (response.code === CODE.EmailInUse.code) {
                    if (window.confirm(`${response.msg}. Press OK if you would like to be redirected to the forgot password form`)) {
                        history.push(LINKS.ForgotPassword);
                    }
                }
            }
        }
    });

    const register = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        if (!signUpSchema.isValidSync(form)) {
            PubSub.publish(PUBS.Snack, {message: 'Please fill in required fields.', severity: 'error'});
            return;
        }
        registerUser(form);
    }

    return (
        <FormControl className={classes.form} error={!formValid}>
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
                    <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        error={passwordError !== null}
                        helperText={passwordError}
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
                        autoComplete="current-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <RadioGroup aria-label="existing-customer-check" name="existing-customer-check" value={existingCustomer} onChange={handleRadioSelect}>
                            <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                            <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox value="allowExtraEmails" color="primary" onChange={handleCheckbox} />}
                        label="I want to receive marketing promotions and updates via email."
                    />
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                color="secondary"
                className={classes.submit}
                onClick={register}
            >
                Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Link href={LINKS.LogIn} variant="body2">
                        <Typography component="body2">
                            Already have an account? Sign in
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </FormControl>
    );
}

export default SignUpForm;