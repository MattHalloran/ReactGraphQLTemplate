import { useParams } from 'react-router-dom';
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
import { lightTheme, LINKS, PUBS, PubSub } from 'utils';

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
    linkRight: {
        display: 'block',
        textAlign: 'right',
    },
}));

function LogInForm({
    onSessionUpdate,
    onRedirect
}) {
    const urlParams = useParams();
    const classes = useStyles();
    const [login, {loading}] = useMutation(loginMutation);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: logInSchema,
        onSubmit: (values) => {
            PubSub.publish(PUBS.Loading, true);
            login({
                variables: {
                    ...values,
                    verificationCode: urlParams.code
                }
            }).then((response) => {
                const data = response.data.login;
                PubSub.publish(PUBS.Loading, false);
                if (data !== null) {
                    onSessionUpdate(data);
                    onRedirect(LINKS.Shopping);
                } else PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error' });
            }).catch((response) => {
                console.error(response)
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
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
                    <Link href={LINKS.ForgotPassword} variant="body2">
                        <Typography variant="body2">
                            Forgot Password?
                        </Typography>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link href={LINKS.Register} variant="body2">
                        <Typography variant="body2" className={classes.linkRight}>
                            Don't have an account? Sign up
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </form>
    );
}

export { LogInForm };