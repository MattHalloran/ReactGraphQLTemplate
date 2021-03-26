import { useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import { resetPasswordRequest } from 'query/http_promises';
import { Button, TextField, Link, Typography } from '@material-ui/core';
import { FormControl, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LINKS } from 'utils/consts';
import * as validation from 'utils/validations';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function ForgotPasswordForm() {
    let history = useHistory();
    const classes = useStyles();
    const [email, setEmail] = useHistoryState("li_email", "");
    let emailError = validation.emailValidation(email);

    const forgotPassword = () => {
        resetPasswordRequest(email).then(() => {
            history.replace('/');
        }).catch(error => {
            console.error(error);
        })
    }

    const submit = (event) => {
        event.preventDefault();
        if (!emailError) {
            forgotPassword();
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
            <Grid container justify="flex-end">
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