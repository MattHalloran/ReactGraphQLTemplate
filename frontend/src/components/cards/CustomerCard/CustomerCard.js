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
import { makeStyles } from '@material-ui/core/styles';
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
    first_name,
    last_name,
    business,
    pronouns = DEFAULT_PRONOUNS[3],
    account_status = ACCOUNT_STATUS.Deleted,
    emails = null,
    phones = null,
    onUpdate,
}) {
    const classes = useStyles();

    const status_map = (status) => {
        switch (status) {
            case ACCOUNT_STATUS.Deleted:
                return ['Deleted', 'grey'];
            case ACCOUNT_STATUS.Unlocked:
                return ['Unlocked', 'green'];
            case ACCOUNT_STATUS.WaitingApproval:
                return ['Waiting Approval', 'yellow'];
            case ACCOUNT_STATUS.SoftLock:
                return ['Soft Locked', 'pink'];
            case ACCOUNT_STATUS.HardLock:
                return ['Hard Locked', 'red'];
            default:
                return ['Unknown', 'red'];
        }
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
        if (!window.confirm(`Are you sure you want to delete the account for ${first_name} ${last_name}?`)) return;
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
    switch (account_status) {
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

    let phoneChips = phones?.map(p => (
        <Chip
            className={classes.chip}
            onClick={() => callPhone(`${p.country_code}${p.unformatted_number}`)}
            icon={<PhoneIcon />}
            label={p.unformatted_number}
            color="secondary" />
    ));

    const sendEmail = (address, subject = '', body = '') => {
        let mailto = `mailto:${address}?subject=${subject}&body=${body}`;
        window.location.href = mailto;
    }

    let emailChips = emails?.map(e => (
        <Chip
            className={classes.chip}
            onClick={() => sendEmail(e.email_address)}
            icon={<EmailIcon />}
            label={e.email_address}
            color="secondary" />
    ));

    return (
        <Card className={classes.root} style={{ border: `2px solid ${status_map(account_status)[1]}` }}>
            <CardContent className={classes.content}>
                <Typography gutterBottom variant="h6" component="h2">
                    {first_name} {last_name}
                </Typography>
                <p>Status: {status_map(account_status)[0]}</p>
                <p>Business: {business.name}</p>
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
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    business: PropTypes.object.isRequired,
    pronouns: PropTypes.string,
    account_status: PropTypes.number.isRequired,
    emails: PropTypes.array,
    phones: PropTypes.array,
    onUpdate: PropTypes.func.isRequired,
}

export { CustomerCard };