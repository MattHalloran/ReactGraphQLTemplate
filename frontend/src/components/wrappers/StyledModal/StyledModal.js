import PropTypes from 'prop-types';
import { Modal, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    root: {

    },
    content: {
        outline: 0,
        display: 'flex',
    },
    bodyChildren: {
        borderRadius: '10px',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        border: `3px solid ${theme.palette.primary.contrastText}`,
    },
    xButton: {
        height: 50,
        width: 50,
        left: -25,
        top: -25,
        borderRadius: '100%',
        background: '#A3333D',
        cursor: 'pointer',
        zIndex: 2,
        '&:hover': {
            background: '#A8333D',
        }
    },
    x: {
        fill: theme.palette.primary.contrastText,
    },
}));

// const ESCAPE_KEY = 27;

function StyledModal({
    open = true,
    onClose,
    children,
}) {
    const classes = useStyles();

    return (
        <Modal
            className={classes.root}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            open={open}
            onClose={onClose}>
            <div style={{margin: 'auto', maxWidth: 'calc(100vw - 100px)', maxHeight: 'calc(100vh - 50px)'}} className={classes.content}>
                <div className={classes.bodyChildren}>
                    {children}
                </div>
                <IconButton
                    className={classes.xButton}
                    aria-label="close modal"
                    onClick={onClose}>
                    <CloseIcon className={classes.x} />
                </IconButton>
            </div>
        </Modal>
    );
}

StyledModal.propTypes = {
    open: PropTypes.bool,
    children: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default StyledModal;