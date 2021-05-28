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
import { makeStyles } from '@material-ui/core/styles';
import { LINKS, PUBS, PubSub } from 'utils';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
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
    const [login] = useMutation(loginMutation);

    const formik = useFormik({
        initialValues: {},
        validationSchema: logInSchema,
        onSubmit: (values) => {
            PubSub.publish(PUBS.loading, true);
            login({
                variables: {
                    ...values,
                    verificationCode: urlParams.code
                }
            }).then((response) => {
                PubSub.publish(PUBS.loading, false);
                if (response.ok) {
                    onSessionUpdate(response.session)
                    if (response.emailVerified) PubSub.publish(PUBS.Snack, { message: 'Email verified.' });
                    onRedirect(LINKS.Shopping);
                } else PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
            }).catch((response) => {
                PubSub.publish(PUBS.loading, false);
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
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