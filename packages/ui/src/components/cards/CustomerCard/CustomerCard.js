import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types'
import {
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Tooltip,
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
import { emailLink, mapIfExists, phoneLink, PUBS, PubSub, showPhone } from 'utils';
import { ListDialog } from 'components/dialogs';

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
    actionButton: {
        color: theme.palette.primary.contrastText,
    },
    icon: {
        fill: theme.palette.primary.contrastText,
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
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

    const callPhone = (phoneLink) => {
        setPhoneDialogOpen(false);
        if (phoneLink) window.location.href = phoneLink;
    }

    const sendEmail = (emailLink) => {
        setEmailDialogOpen(false);
        if (emailLink) window.open(emailLink, '_blank', 'noopener,noreferrer')
    }

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

    // Phone and email [label, value] pairs
    const phoneList = mapIfExists(customer, 'phones', (p) => ([showPhone(p.number), phoneLink(p.number)]));
    const emailList = mapIfExists(customer, 'emails', (e) => ([e.emailAddress, emailLink(e.emailAddress)]));

    return (
        <Card className={classes.root} style={{ border: `2px solid ${status_map[status][1]}` }}>
            {phoneDialogOpen ? (
                <ListDialog
                    title={`Call ${customer?.fullName}`}
                    data={phoneList}
                    onClose={callPhone} />
            ) : null}
            {emailDialogOpen ? (
                <ListDialog
                    title={`Email ${customer?.fullName}`}
                    data={emailList}
                    onClose={sendEmail} />
            ) : null}
            <CardContent className={classes.content} onClick={() => onEdit(customer)}>
                <Typography gutterBottom variant="h6" component="h2">
                    {customer?.firstName} {customer?.lastName}
                </Typography>
                <p>Status: {status_map[customer?.status][0]}</p>
                <p>Business: {customer?.business?.name}</p>
                <p>Pronouns: {customer?.pronouns ?? 'Unset'}</p>
            </CardContent>
            <CardActions>
                {actions?.map((o, index) =>
                    <Button
                        key={index}
                        className={classes.actionButton}
                        variant="text"
                        onClick={o[0]}>{o[1]}</Button>)}
                {(phoneList.length > 0) ?
                    (<Tooltip title="View phone numbers" placement="bottom">
                        <IconButton onClick={() => setPhoneDialogOpen(true)}>
                            <PhoneIcon className={classes.icon} />
                        </IconButton>
                    </Tooltip>)
                    : null}
                {(emailList.length > 0) ?
                    (<Tooltip title="View emails" placement="bottom">
                        <IconButton onClick={() => setEmailDialogOpen(true)}>
                            <EmailIcon className={classes.icon} />
                        </IconButton>
                    </Tooltip>)
                    : null}
            </CardActions>
        </Card>
    );
}

CustomerCard.propTypes = {
    customer: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
}

export { CustomerCard };