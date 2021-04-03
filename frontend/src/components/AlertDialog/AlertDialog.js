import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PubSub from 'utils/pubsub';
import { PUBS } from 'utils/consts';

function AlertDialog() {
    const default_state = {
        title: null,
        message: null,
        firstButtonText: 'Ok',
        firstButtonClicked: null,
        secondButtonText: null,
        secondButtonClicked: null,
    };
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
                    <Button onClick={state.secondButtonClicked} color="primary">
                        {state.secondButtonText}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}

export default AlertDialog;