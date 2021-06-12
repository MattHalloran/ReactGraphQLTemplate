//TODO not used yet. Currently same as signup form

import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { lightTheme, LINKS, PUBS, PubSub, useHistoryState } from 'utils';
import { employeeSchema } from '@local/shared';
import { Button, TextField, Link } from '@material-ui/core';
import { FormControl, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CODE, DEFAULT_PRONOUNS } from '@local/shared';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        // marginTop: theme.spacing(3),
        marginTop: lightTheme.spacing(3),
    },
    submit: {
        // margin: theme.spacing(3, 0, 2),
        margin: lightTheme.spacing(3, 0, 2),
    },
}));

function AddEmployeeForm() {
    let history = useHistory();
    const classes = useStyles();
    const [firstName, setFirstName] = useHistoryState("ae_first_name", "");
    const [lastName, setLastName] = useHistoryState("ae_last_name", "");
    const [pronouns, setPronouns] = useHistoryState("ae_pronoun", DEFAULT_PRONOUNS[3]);
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");

    let firstNameError = employeeSchema.validateSyncAt('firstName', firstName);
    let lastNameError = employeeSchema.validateSyncAt('lastName', lastName);
    let pronounsError = employeeSchema.validateSyncAt('pronouns', pronouns);
    let passwordError = employeeSchema.validateSyncAt('password', password);
    let confirmPasswordError = password === confirmPassword ? null : 'Passwords do not match';
    let formValid = (firstNameError || lastNameError || pronounsError || passwordError || confirmPasswordError) === null;

    const addEmployee = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        if (!employeeSchema.isValidSync(form)) {
            PubSub.publish(PUBS.Snack, {message: 'Please fill in required fields.', severity: 'error'});
            return;
        }
        // signIn(data).then(() => {
        //     if (existingCustomer) {
        //         alert('Welcome to New Life Nursery! You may now begin shopping. Please verify your email within 48 hours.');
        //     } else {
        //         alert('Welcome to New Life Nursery! Since you have never ordered from us before, we must approve your account before you can order. If this was a mistake, you can edit this in the /profile page');
        //     }
        //     history.push(LINKS.Shopping);
        // }).catch(err => {
        //     console.error(err);
        //     if (err.code === CODE.EmailInUse.code) {
        //         if (window.confirm(`${err.message}. Press OK if you would like to be redirected to the forgot password form`)) {
        //             history.push(LINKS.ForgotPassword);
        //         }
        //     } else {
        //         PubSub.publish(PUBS.Snack, {message: err.message, severity: 'error'});
        //     }
        // })
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
            </Grid>
            <Button
                type="submit"
                fullWidth
                color="secondary"
                className={classes.submit}
                onClick={addEmployee}
            >
                Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Link href={LINKS.LogIn} variant="body2">
                        Already have an account? Sign in
                </Link>
                </Grid>
            </Grid>
        </FormControl>
    );
}

export { AddEmployeeForm };