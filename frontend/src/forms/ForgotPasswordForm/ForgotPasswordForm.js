import { useHistoryState } from 'utils/useHistoryState';
import { Button, TextField, Link, Typography } from '@material-ui/core';
import { FormControl, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PubSub from 'utils/pubsub';
import { PUBS } from '@local/shared';
import { LINKS } from 'utils/consts';
import { forgotPasswordSchema } from '@local/shared';
import { useMutate } from 'restful-react';

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
    const [email, setEmail] = useHistoryState("li_email", "");
    let emailError = forgotPasswordSchema.validateSyncAt('email', email);

    const { mutate: resetPassword } = useMutate({
        verb: 'PUT',
        path: 'reset-password',
        resolve: (response) => {
            if (response.ok) {
                onRedirect(LINKS.Home);
            }
            else {
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
            }
        }
    });

    const submit = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        if (forgotPasswordSchema.isValidSync(form)) {
            resetPassword(form);
        }
    }

    return (
        <FormControl className={classes.form} error={emailError}>
            <Grid container spacing={2}>
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
            </Grid>
            <Button
                type="submit"
                fullWidth
                color="secondary"
                className={classes.submit}
                onClick={submit}
            >
                Submit
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Link href={LINKS.LogIn} variant="body2">
                        <Typography component="body2">
                            Remember? Back to Log In
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </FormControl>
    );
}

export default ForgotPasswordForm;