import React from 'react';
import PropTypes from 'prop-types'
import { 
    Button,
    Card,
    CardActions,
    CardContent, 
    Chip,
    Typography 
} from '@material-ui/core';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { modifyUser } from 'query/http_promises';
import { ACCOUNT_STATUS, DEFAULT_PRONOUNS } from '@local/shared';
import { PUBS, PubSub } from 'utils';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        cursor: 'pointer',
    },
    content: {
        padding: 8,
        position: 'inherit',
    },
    chip: {
        margin: 2,
        cursor: 'pointer',
    },
    actionButton: {
        color: theme.palette.primary.contrastText,
    },
}));

function CustomerCard({
    id,
    firstName,
    lastName,
    business,
    pronouns = DEFAULT_PRONOUNS[3],
    status = ACCOUNT_STATUS.Deleted,
    emails = null,
    phones = null,
    onUpdate,
}) {
    const classes = useStyles();

    const status_map = {
        [ACCOUNT_STATUS.Deleted]: ['Deleted', 'grey'],
        [ACCOUNT_STATUS.Unlocked]: ['Unlocked', 'green'],
        [ACCOUNT_STATUS.WaitingApproval]: ['Waiting Approval', 'yellow'],
        [ACCOUNT_STATUS.SoftLock]: ['Soft Locked', 'pink'],
        [ACCOUNT_STATUS.HardLock]: ['Hard Locked', 'red']
    }

    const view_orders = () => {
        console.log('TODOOO');
        alert('Coming soon!');
    }

    const edit = () => {
        console.log('TODOOOO');
        alert('Coming soon!')
    }

    const approve_user = () => {
        modifyUser(id, 'APPROVE')
            .then(response => {
                onUpdate(response.customers);
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: 'Failed to approve user.', severity: 'error'});
            });
    }

    const unlock_user = () => {
        modifyUser(id, 'UNLOCK')
            .then(response => {
                onUpdate(response.customers);
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: 'Failed to unlock user.', severity: 'error'});
            });
    }

    const lock_user = () => {
        modifyUser(id, 'LOCK')
            .then(response => {
                onUpdate(response.customers);
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: 'Failed to lock user.', severity: 'error'});
            });
    }

    const delete_user = () => {
        if (!window.confirm(`Are you sure you want to delete the account for ${firstName} ${lastName}?`)) return;
        modifyUser(id, 'DELETE')
            .then(response => {
                onUpdate(response.customers);
            })
            .catch(err => {
                console.error(err);
                PubSub.publish(PUBS.Snack, {message: 'Failed to delete user.', severity: 'error'});
            });
    };

    let orders_action = [view_orders, 'Orders'];
    let edit_action = [edit, 'Edit']
    let approve_action = [approve_user, 'Approve'];
    let unlock_action = [unlock_user, 'Unlock'];
    let lock_action = [lock_user, 'Lock'];
    let delete_action = [delete_user, 'Delete'];

    let actions = [orders_action, edit_action];
    switch (status) {
        case ACCOUNT_STATUS.Unlocked:
            actions.push(lock_action);
            break;
        case ACCOUNT_STATUS.WaitingApproval:
            actions.push(approve_action);
            break;
        case ACCOUNT_STATUS.SoftLock:
        case ACCOUNT_STATUS.HardLock:
            actions.push(unlock_action);
            break;
        default:
            break;
    }
    actions.push(delete_action);

    const callPhone = (number) => {
        let tel = `tel:${number}`;
        window.location.href = tel;
    }

    let phoneChips = phones?.map((p, index) => (
        <Chip
            key={index}
            className={classes.chip}
            onClick={() => callPhone(`${p.countryCode}${p.unformattedNumber}`)}
            icon={<PhoneIcon />}
            label={p.unformattedNumber}
            color="secondary" />
    ));

    const sendEmail = (address, subject = '', body = '') => {
        let mailto = `mailto:${address}?subject=${subject}&body=${body}`;
        window.location.href = mailto;
    }

    let emailChips = emails?.map((e, index) => (
        <Chip
            key={index}
            className={classes.chip}
            onClick={() => sendEmail(e.emailAddress)}
            icon={<EmailIcon />}
            label={e.emailAddress}
            color="secondary" />
    ));

    return (
        <Card className={classes.root} style={{ border: `2px solid ${status_map[status][1]}` }}>
            <CardContent className={classes.content}>
                <Typography gutterBottom variant="h6" component="h2">
                    {firstName} {lastName}
                </Typography>
                <p>Status: {status_map[status][0]}</p>
                <p>Business: {business?.name}</p>
                <p>Pronouns: {pronouns}</p>
                {phoneChips}
                {emailChips}
            </CardContent>
            <CardActions>
                {actions?.map((o, index) =>
                    <Button
                        key={index}
                        className={classes.actionButton}
                        variant="text"
                        onClick={o[0]}>{o[1]}</Button>)}
            </CardActions>
        </Card>
    );
}

CustomerCard.propTypes = {
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    business: PropTypes.object.isRequired,
    pronouns: PropTypes.string,
    status: PropTypes.string.isRequired,
    emails: PropTypes.array,
    phones: PropTypes.array,
    onUpdate: PropTypes.func.isRequired,
}

export { CustomerCard };