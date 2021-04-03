import React, { useEffect, useState } from 'react';
import { IconButton, Button, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    default: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    },
    warning: {
        background: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
    },
    error: {
        background: theme.palette.error.dark,
        color: theme.palette.error.contrastText,
    }
}));

function Snack() {
    const classes = useStyles();
    const default_state = {
        message: null,
        severity: 'default',
        buttonText: null,
        buttonClicked: null,
        autoHideDuration: 5000,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
        },
    };
    const [state, setState] = useState(default_state)

    function getSnackClass(severity) {
        if (severity === 'error') return classes.error;
        if (severity === 'warning') return classes.warning;
        return classes.default;
    }
    let open = state.message !== null;

    useEffect(() => {
        let snackSub = PubSub.subscribe(PUBS.Snack, (_, o) => setState({ ...default_state, ...o }));
        return () => PubSub.unsubscribe(snackSub);
    }, [])

    return (
        <Snackbar
        ContentProps={{
            classes: {
              root: getSnackClass(state.severity)
            }
          }}
            anchorOrigin={state.anchorOrigin}
            open={open}
            autoHideDuration={state.autoHideDuration}
            onClose={() => setState(default_state)}
            message={state.message}
            action={
                <React.Fragment>
                    {state.buttonText ? <Button color="secondary" size="small" onClick={state.buttonClicked}>
                        {state.buttonText}
                    </Button> : null}
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setState(default_state)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </React.Fragment>
            }
        />
    );
}

export default Snack;