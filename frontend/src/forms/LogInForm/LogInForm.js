import { useParams, useHistory } from 'react-router-dom';
import { useHistoryState } from 'utils/useHistoryState';
import * as validation from 'utils/validations';
import { Button, TextField, Link } from '@material-ui/core';
import { FormControl, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LINKS } from 'utils/consts';
import { loginUser } from 'query/http_promises';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
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
    let anyErrors = !validation.passedValidation(emailError, passwordError);

    const login = () => {
        loginUser(email, password, urlParams.code).then(response => {
            if (urlParams.code && response.isEmailVerified) {
                alert('Email has been verified!');
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
            alert('Please fill in required fields');
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
            <Grid container justify="flex-end">
                <Grid item>
                    <Link href={LINKS.Register} variant="body2">
                        Don't have an account? Sign up
                </Link>
                </Grid>
            </Grid>
        </FormControl>
    );
}

export default LogInForm;