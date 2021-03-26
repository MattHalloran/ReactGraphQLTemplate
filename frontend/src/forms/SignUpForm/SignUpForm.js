import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import * as validation from 'utils/validations';
import { Button, TextField, Checkbox, Link } from '@material-ui/core';
import { FormControl, FormControlLabel, FormHelperText, Grid, RadioGroup, Radio, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LINKS, DEFAULT_PRONOUNS, STATUS_CODES } from 'utils/consts';
import { registerUser } from 'query/http_promises';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function SignUpForm() {
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

    let firstNameError = validation.firstNameValidation(firstName);
    let lastNameError = validation.lastNameValidation(lastName);
    let pronounsError = validation.pronounValidation(pronouns);
    let businessError = validation.businessValidation(business);
    let emailError = validation.emailValidation(email);
    let phoneError = validation.phoneNumberValidation(phone);
    let passwordError = validation.passwordValidation(password);
    let confirmPasswordError = validation.confirmPasswordValidation(password, confirmPassword);
    let existingCustomerError = '';
    let anyErrors = !validation.passedValidation(firstNameError, lastNameError, pronounsError, businessError,
        emailError, phoneError, passwordError, confirmPasswordError, existingCustomerError);

    const handleCheckbox = (event) => {
        console.log('TODO')
    }

    const handleRadioSelect = (event) => {
        setExistingCustomer(event.target.value);
    }

    const register = () => {
        let data = {
            "first_name": firstName,
            "last_name": lastName,
            "pronouns": pronouns,
            "business": business,
            "emails": [{ "email_address": email, "receives_delivery_updates": true }],
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
        registerUser(data).then(() => {
            if (existingCustomer) {
                alert('Welcome to New Life Nursery! You may now begin shopping. Please verify your email within 48 hours.');
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
        if (anyErrors) {
            alert('Please fill in required fields');
            return;
        }
        register();
    }

    return (
        <FormControl className={classes.form} error={anyErrors}>
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
                        <FormHelperText>{existingCustomerError}</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox value="allowExtraEmails" color="primary" onChange={handleCheckbox} />}
                        label="I want to receive inspiration, marketing promotions and updates via email."
                    />
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                color="secondary"
                className={classes.submit}
                onClick={submit}
            >
                Sign Up
            </Button>
            <Grid container justify="flex-end">
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