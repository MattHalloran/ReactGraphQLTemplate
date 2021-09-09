import React from 'react';
import { signUpMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { CODE, DEFAULT_PRONOUNS, signUpSchema } from '@local/shared';
import { useFormik } from 'formik';
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Link,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { LINKS, PUBS, PubSub } from 'utils';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { useHistory } from 'react-router-dom';
import { useTheme } from '@emotion/react';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    phoneInput: {
        width: '100%',
    },
    linkRight: {
        flexDirection: 'row-reverse',
    },
    clickSize: {
        color: theme.palette.secondary.light,
        cursor: 'pointer',
        minHeight: '48px', // Lighthouse recommends this for SEO, as it is more clickable
        display: 'flex',
        alignItems: 'center',
    },
}));

function SignUpForm({
    business,
    onSessionUpdate
}) {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const [signUp, { loading }] = useMutation(signUpMutation);

    const formik = useFormik({
        initialValues: {
            accountApproved: "true",
            marketingEmails: "true",
            firstName: '',
            lastName: '',
            pronouns: '',
            business: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: signUpSchema,
        onSubmit: (values) => {
            mutationWrapper({
                mutation: signUp,
                data: { variables: { 
                    ...values, 
                    accountApproved: Boolean(values.accountApproved),
                    marketingEmails: Boolean(values.marketingEmails),
                    theme: theme.palette.mode ?? 'light',
                } },
                onSuccess: (response) => {
                    onSessionUpdate(response.data.signUp);
                    if (response.data.signUp?.accountApproved) {
                        PubSub.publish(PUBS.AlertDialog, {
                            message: `Welcome to ${business?.BUSINESS_NAME?.Short}. You may now begin shopping. Please verify your email within 48 hours.`,
                            firstButtonText: 'OK',
                            firstButtonClicked: () => history.push(LINKS.Shopping),
                        });
                    } else {
                        PubSub.publish(PUBS.AlertDialog, {
                            message: `Welcome to ${business?.BUSINESS_NAME?.Short}. Please verify your email within 48 hours. Since you have never ordered from us before, we must approve your account before you can order. If this was a mistake, you can edit this in the /profile page.`,
                            firstButtonText: 'OK',
                            firstButtonClicked: () => history.push(LINKS.Profile),
                        });
                    }
                },
                onError: (response) => {
                    if (Array.isArray(response.graphQLErrors) && response.graphQLErrors.some(e => e.extensions.code === CODE.EmailInUse.code)) {
                        PubSub.publish(PUBS.AlertDialog, {
                            message: `${response.message}. Press OK if you would like to be redirected to the forgot password form.`,
                            firstButtonText: 'OK',
                            firstButtonClicked: () => history.push(LINKS.ForgotPassword),
                        });
                    }
                }
            })
        },
    });

    return (
        <form className={classes.form} onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        autoFocus
                        id="firstName"
                        name="firstName"
                        autoComplete="fname"
                        label="First Name"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="lastName"
                        name="lastName"
                        autoComplete="lname"
                        label="Last Name"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        id="pronouns"
                        name="pronouns"
                        options={DEFAULT_PRONOUNS}
                        value={formik.values.pronouns}
                        onChange={(_, value) => formik.setFieldValue('pronouns', value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Pronouns"
                                value={formik.values.pronouns}
                                onChange={formik.handleChange}
                                error={formik.touched.pronouns && Boolean(formik.errors.pronouns)}
                                helperText={formik.touched.pronouns && formik.errors.pronouns}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="business"
                        name="business"
                        autoComplete="business"
                        label="Business"
                        value={formik.values.business}
                        onChange={formik.handleChange}
                        error={formik.touched.business && Boolean(formik.errors.business)}
                        helperText={formik.touched.business && formik.errors.business}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        autoComplete="email"
                        label="Email Address"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        label="Phone Number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        label="Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        label="Confirm Password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <RadioGroup
                            id="accountApproved"
                            name="accountApproved"
                            aria-label="existing-customer-check"
                            value={formik.values.accountApproved}
                            onChange={formik.handleChange}
                        >
                            <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                            <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                        </RadioGroup>
                        <FormHelperText>{formik.touched.accountApproved && formik.errors.accountApproved}</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="marketingEmails"
                                name="marketingEmails"
                                value="marketingEmails"
                                color="secondary"
                                checked={formik.values.marketingEmails}
                                onChange={formik.handleChange}
                            />
                        }
                        label="I want to receive marketing promotions and updates via email."
                    />
                </Grid>
            </Grid>
            <Button
                fullWidth
                disabled={loading}
                type="submit"
                color="secondary"
                className={classes.submit}
            >
                Sign Up
            </Button>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Link onClick={() => history.push(LINKS.LogIn)}>
                        <Typography className={classes.clickSize}>
                            Already have an account? Log in
                        </Typography>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link onClick={() => history.push(LINKS.ForgotPassword)}>
                        <Typography className={`${classes.clickSize} ${classes.linkRight}`}>
                            Forgot Password?
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </form>
    );
}

export { SignUpForm };