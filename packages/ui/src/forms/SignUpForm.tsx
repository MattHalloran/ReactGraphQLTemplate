import { signUpMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { CODE, DEFAULT_PRONOUNS, signUpSchema } from '@local/shared';
import { useFormik } from 'formik';
import {
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Link,
    TextField,
    Typography,
    useTheme
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { combineStyles, LINKS, PUBS } from 'utils';
import PubSub from 'pubsub-js';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { useHistory } from 'react-router-dom';
import { formStyles } from './styles';
import { CommonProps } from 'types';
import { signUp } from 'graphql/generated/signUp';
import { useCallback, useEffect } from 'react';
import { checkPushNotifications } from 'serviceWorkerRegistration';

const componentStyles = () => ({
    phoneInput: {
        width: '100%',
    },
})

const useStyles = makeStyles(combineStyles(formStyles, componentStyles));

export const SignUpForm = ({
    business,
    onSessionUpdate
}: Pick<CommonProps, 'business' | 'onSessionUpdate'>) => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const [signUp, { loading }] = useMutation<signUp>(signUpMutation);

    const formik = useFormik({
        initialValues: {
            marketingEmails: true,
            notifications: false,
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
                data: {
                    variables: {
                        ...values,
                        marketingEmails: Boolean(values.marketingEmails),
                        notifications: Boolean(values.notifications),
                        theme: theme.palette.mode ?? 'light',
                    }
                },
                onSuccess: (response) => {
                    onSessionUpdate(response.data.signUp);
                    PubSub.publish(PUBS.AlertDialog, {
                        message: `Welcome to ${business?.BUSINESS_NAME?.Short}. Please verify your email within 48 hours.`,
                        firstButtonText: 'OK',
                        firstButtonClicked: () => history.push(LINKS.Profile),
                    });
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

    /**
     * Register push notifications for the user.
     */
    useEffect(() => {
        if (Boolean(formik.values.notifications)) checkPushNotifications();
    }, [formik.values.notifications]);

    const setPronouns = useCallback((_, value) => formik.setFieldValue('pronouns', value), [formik]);
    const toLogIn = useCallback(() => history.push(LINKS.LogIn), [history]);
    const toForgotPassword = useCallback(() => history.push(LINKS.ForgotPassword), [history]);

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
                        options={DEFAULT_PRONOUNS}
                        value={formik.values.pronouns}
                        onChange={setPronouns}
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="marketingEmails"
                                name="marketingEmails"
                                color="secondary"
                                checked={formik.values.marketingEmails}
                                onChange={formik.handleChange}
                            />
                        }
                        label="I want to receive marketing promotions and updates via email."
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="notifications"
                                name="notifications"
                                color="secondary"
                                checked={formik.values.notifications}
                                onChange={formik.handleChange}
                            />
                        }
                        label="I want to receive notifications."
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
                    <Link onClick={toLogIn}>
                        <Typography className={classes.clickSize}>
                            Already have an account? Log in
                        </Typography>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link onClick={toForgotPassword}>
                        <Typography className={`${classes.clickSize} ${classes.linkRight}`}>
                            Forgot Password?
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </form>
    );
}