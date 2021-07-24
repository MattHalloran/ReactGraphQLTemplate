import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';
import { PUBS, PubSub } from 'utils';

const default_state = {
    title: null,
    message: null,
    firstButtonText: 'Ok',
    firstButtonClicked: null,
    secondButtonText: null,
    secondButtonClicked: null,
};

function AlertDialog() {
    const [state, setState] = useState(default_state)
    let open = state.title !== null || state.message !== null;

    useEffect(() => {
        let dialogSub = PubSub.subscribe(PUBS.AlertDialog, (_, o) => {console.log('yoted the yeet ', o); setState({...default_state, ...o})});
        return () => PubSub.unsubscribe(dialogSub);
    }, [])

    return (
        <Dialog
            open={open}
            onClose={() => setState(default_state)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {state.title ? <DialogTitle id="alert-dialog-title">{state.title}</DialogTitle> : null}
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {state.message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={state.firstButtonClicked ?? (() => setState(default_state))} color="primary">
                    {state.firstButtonText}
                </Button>
                {state.secondButtonText ? (
                    <Button onClick={state.secondButtonClicked ?? (() => setState(default_state))} color="primary">
                        {state.secondButtonText}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}

export { AlertDialog };