import { useParams, useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import * as validation from 'utils/validations';
import { Button, TextField, Link } from '@material-ui/core';
import { FormControl, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LINKS, PUBS } from 'utils/consts';
import { loginUser } from 'query/http_promises';
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

function LogInForm() {
    let history = useHistory();
    const urlParams = useParams();
    const classes = useStyles();
    const [email, setEmail] = useHistoryState("li_email", "");
    const [password, setPassword] = useHistoryState("li_password", "");

    let emailError = validation.emailValidation(email);
    let passwordError = validation.defaultStringValidation('password', password);
    console.log('HERE ARE THE ERRORS')
    console.log(emailError, passwordError);
    let anyErrors = !validation.passedValidation(emailError, passwordError);

    const login = () => {
        loginUser(email, password, urlParams.code).then(response => {
            if (urlParams.code && response.isEmailVerified) {
                PubSub.publish(PUBS.Snack, {message: 'Email verified.'});
            }
            history.push(LINKS.Shopping);
        }).catch(err => {
            console.error(err);
            alert(err.msg);
        })
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
                Sign Up
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