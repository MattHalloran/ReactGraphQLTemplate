import { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';
import { PUBS } from 'utils';
import PubSub from 'pubsub-js';

/**
 * Props for opening an alert dialog from a publish event
 */
export interface AlertDialogData {
    /**
     * Title of the dialog
     */
    title?: string | null;
    /**
     * Main text of the dialog
     */
    message?: string | null;
    /**
     * Text of the first button. If not provided, defaults to 'Ok'
     */
    firstButtonText?: string;
    /**
     * Action to perform when the first button is clicked. 
     * All buttons close the dialog.
     */
    firstButtonClicked?: (() => void) | null;
    /**
     * Text of the second button. If not provided, no second button is shown
     */
    secondButtonText?: string | null;
    /**
     * Action to perform when the second button is clicked. 
     * All buttons close the dialog.
     */
    secondButtonClicked?: (() => void) | null;
}

/**
 * Default state for the alert dialog
 */
const default_state: AlertDialogData = {
    title: null,
    message: null,
    firstButtonText: 'Ok',
    firstButtonClicked: null,
    secondButtonText: null,
    secondButtonClicked: null,
};

export const AlertDialog = () => {
    const [state, setState] = useState<AlertDialogData>(default_state)
    let open = state.title !== null || state.message !== null;

    useEffect(() => {
        let dialogSub = PubSub.subscribe(PUBS.AlertDialog, (_, o) => setState({...default_state, ...o}));
        return () => { PubSub.unsubscribe(dialogSub) };
    }, [])

    const handleClick = useCallback((action: (() => void) | null | undefined) => {
        if (action) action();
        setState(default_state);
    }, []);

    const clickFirst = useCallback(() => handleClick(state.firstButtonClicked), [handleClick, state.firstButtonClicked]);
    const clickSecond = useCallback(() => handleClick(state.secondButtonClicked), [handleClick, state.secondButtonClicked]);

    const resetState = useCallback(() => setState(default_state), []);

    return (
        <Dialog
            open={open}
            onClose={resetState}
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
                <Button onClick={clickFirst} color="secondary">
                    {state.firstButtonText}
                </Button>
                {state.secondButtonText ? (
                    <Button onClick={clickSecond} color="secondary">
                        {state.secondButtonText}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}