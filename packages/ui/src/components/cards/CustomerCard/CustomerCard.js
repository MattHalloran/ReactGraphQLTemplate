import React, { useCallback, useMemo } from 'react';
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
import { changeCustomerStatusMutation } from 'graphql/mutation';
import { useMutation } from '@apollo/client';
import { ACCOUNT_STATUS } from '@local/shared';
import { mutationWrapper } from 'graphql/wrappers';
import { useTheme } from '@emotion/react';
import { PUBS, PubSub } from 'utils';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.main,
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
    customer,
    status = ACCOUNT_STATUS.Deleted,
    onEdit,
}) {
    const classes = useStyles();
    const theme = useTheme();
    const [changeCustomerStatus] = useMutation(changeCustomerStatusMutation);

    const status_map = useMemo(() => ({
        [ACCOUNT_STATUS.Deleted]: ['Deleted', 'grey'],
        [ACCOUNT_STATUS.Unlocked]: ['Unlocked', theme.palette.primary.main],
        [ACCOUNT_STATUS.WaitingApproval]: ['Waiting Approval', 'yellow'],
        [ACCOUNT_STATUS.SoftLock]: ['Soft Locked', 'pink'],
        [ACCOUNT_STATUS.HardLock]: ['Hard Locked', 'red']
    }), [theme])

    const edit = () => {
        onEdit(customer);
    }

    const modifyCustomer = useCallback((status, message) => {
        mutationWrapper({
            mutation: changeCustomerStatus,
            data: { variables: { id: customer?.id, status: status } },
            successCondition: (response) => response.changeCustomerStatus !== null,
            successMessage: () => message
        })
    }, [changeCustomerStatus, customer])

    const confirmDelete = useCallback(() => {
        PubSub.publish(PUBS.AlertDialog, {
            message: `Are you sure you want to delete the account for ${customer.firstName} ${customer.lastName}?`,
            firstButtonText: 'Yes',
            firstButtonClicked: () => modifyCustomer(ACCOUNT_STATUS.Deleted, 'Customer deleted'),
            secondButtonText: 'No',
        });
    }, [customer, modifyCustomer])

    let edit_action = [edit, 'Edit']
    let approve_action = [() => modifyCustomer(ACCOUNT_STATUS.Unlocked, 'Customer Approved'), 'Approve'];
    let unlock_action = [() => modifyCustomer(ACCOUNT_STATUS.Unlocked, 'Customer unlocked'), 'Unlock'];
    let lock_action = [() => modifyCustomer(ACCOUNT_STATUS.HardLock, 'Customer locked'), 'Lock'];
    let delete_action = [confirmDelete, 'Delete'];

    let actions = [edit_action];
    switch (customer?.status) {
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


    let phoneChips = Array.isArray(customer?.phones) ? customer.phones.map((p, index) => (
        <Chip
            key={index}
            className={classes.chip}
            onClick={() => callPhone(`${p.countryCode}${p.unformattedNumber}`)}
            icon={<PhoneIcon />}
            label={p.unformattedNumber}
            color="secondary" />
    )) : null;

    let emailChips = Array.isArray(customer?.emails) ? customer.emails.map((e, index) => (
        <Chip
            key={index}
            className={classes.chip}
            onClick={() => sendEmail(e.emailAddress)}
            icon={<EmailIcon />}
            label={e.emailAddress}
            color="secondary" />
    )) : null;

    const callPhone = (number) => window.location.href = `tel:${number}`
    const sendEmail = (address, subject = '', body = '') => window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;

    return (
        <Card className={classes.root} style={{ border: `2px solid ${status_map[status][1]}` }} onClick={() => onEdit(customer)}>
            <CardContent className={classes.content}>
                <Typography gutterBottom variant="h6" component="h2">
                    {customer?.firstName} {customer?.lastName}
                </Typography>
                <p>Status: {status_map[customer?.status][0]}</p>
                <p>Business: {customer?.business?.name}</p>
                <p>Pronouns: {customer?.pronouns ?? 'Unset'}</p>
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
    customer: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
}

export { CustomerCard };