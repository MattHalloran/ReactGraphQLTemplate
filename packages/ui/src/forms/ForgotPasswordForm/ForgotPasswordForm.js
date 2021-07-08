import { requestPasswordChangeMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { requestPasswordChangeSchema } from '@local/shared';
import { useFormik } from 'formik';
import {
    Button,
    Grid,
    Link,
    TextField,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { LINKS, PUBS, PubSub } from 'utils';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function ForgotPasswordForm({
    onRedirect
}) {
    const classes = useStyles();
    const [requestPasswordChange, {loading}] = useMutation(requestPasswordChangeMutation);

    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: requestPasswordChangeSchema,
        onSubmit: (values) => {
            PubSub.publish(PUBS.Loading, true);
            console.log('in onsubmit', values)
            requestPasswordChange({
                variables: values
            }).then((response) => {
                console.log('yee', response)
                PubSub.publish(PUBS.Loading, false);
                if (response.ok) {
                    PubSub.publish(PUBS.Snack, { message: 'Request sent. Please check email.' });
                    onRedirect(LINKS.Home);
                } else PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            }).catch((response) => {
                console.log('oh no', response)
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            })
        },
    });

    return (
        <form className={classes.form} onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        autoFocus
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
            </Grid>
            <Button
                fullWidth
                disabled={loading}
                type="submit"
                color="secondary"
                className={classes.submit}
            >
                Submit
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Link href={LINKS.LogIn} variant="body2">
                        <Typography variant="body2">
                            Remember? Back to Log In
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </form>
    );
}

export { ForgotPasswordForm };