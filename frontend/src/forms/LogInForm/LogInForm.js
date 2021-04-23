import { useParams, useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import * as validation from 'utils/validations';
import { Button, TextField, Link } from '@material-ui/core';
import { FormControl, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LINKS, PUBS } from 'utils/consts';
import { useMutate } from "restful-react";
import PubSub from 'utils/pubsub';

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
    let history = useHistory();
    const urlParams = useParams();
    const classes = useStyles();
    const [email, setEmail] = useHistoryState("li_email", "");
    const [password, setPassword] = useHistoryState("li_password", "");

    const { mutate: loginUser, loading } = useMutate({
        verb: 'PUT',
        path: 'login',
        resolve: (response) => {
            if (response.ok) {
                onSessionUpdate(response.session);
                if (response.emailVerified) PubSub.publish(PUBS.Snack, {message: 'Email verified.'});
                onRedirect(LINKS.Shopping);
            }
            else {
                PubSub.publish(PUBS.Session, null);
                PubSub.publish(PUBS.Snack, { message: response.msg, severity: 'error' });
            }
        }
    });

    let emailError = validation.emailValidation(email);
    let passwordError = validation.defaultStringValidation('password', password);
    let anyErrors = !validation.passedValidation(emailError, passwordError);

    const login = () => {
        const formData = new FormData()
        formData.append('email', email);
        formData.append('password', password);
        formData.append('verificationCode', urlParams.code);
        loginUser(formData);
    }

    const submit = (event) => {
        event.preventDefault();
        if (anyErrors) {
            PubSub.publish(PUBS.Snack, {message: 'Please fill in required fields', severity: 'error'});
            return;
        }
        login();
    }

    return (
        <FormControl className={classes.form} error={anyErrors}>
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
            </Grid>
            <Button
                type="submit"
                fullWidth
                color="secondary"
                className={classes.submit}
                onClick={submit}
            >
                Log In
            </Button>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Link href={LINKS.ForgotPassword} variant="body2">
                        <Typography component="body2">
                            Forgot Password?
                        </Typography>
                    </Link>
                </Grid>
                <Grid item xs={6}>
                    <Link href={LINKS.Register} variant="body2">
                        <Typography component="body2" className={classes.linkRight}>
                            Don't have an account? Sign up
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </FormControl>
    );
}

export default LogInForm;