import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { loginMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { logInSchema } from '@local/shared';
import { useFormik } from 'formik';
import {
    Button,
    Grid,
    Link,
    TextField,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { LINKS } from 'utils';
import { mutationWrapper } from 'graphql/utils/wrappers';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    linkRight: {
        flexDirection: 'row-reverse',
    },
    clickSize: {
        color: theme.palette.secondary.light,
        minHeight: '48px', // Lighthouse recommends this for SEO, as it is more clickable
        display: 'flex',
        alignItems: 'center',
    },
}));

function LogInForm({
    onSessionUpdate,
    onRedirect
}) {
    const classes = useStyles();
    const history = useHistory();
    const urlParams = useParams();
    const [login, {loading}] = useMutation(loginMutation);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: logInSchema,
        onSubmit: (values) => {
            mutationWrapper({
                mutation: login,
                data: { variables: { ...values, verificationCode: urlParams.code } },
                successCondition: (response) => response.data.login !== null,
                onSuccess: (response) => { onSessionUpdate(response.data.login); onRedirect(LINKS.Shopping) },
            })
        },
    });

    return (
        <form className={classes.form} onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
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
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        label="Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
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
                Log In
                    </Button>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Link onClick={() => history.push(LINKS.ForgotPassword)}>
                        <Typography className={classes.clickSize}>
                            Forgot Password?
                        </Typography>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link onClick={() => history.push(LINKS.Register)}>
                        <Typography className={`${classes.clickSize} ${classes.linkRight}`}>
                            Don't have an account? Sign up
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </form>
    );
}

export { LogInForm };