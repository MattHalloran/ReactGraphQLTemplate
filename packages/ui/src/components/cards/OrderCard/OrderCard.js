import React from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';
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
    Phone as PhoneIcon
} from "@material-ui/icons";
import { makeStyles } from '@material-ui/styles';
import { ListDialog } from 'components';
import { emailLink, mapIfExists, phoneLink, showPhone } from 'utils';

const cardStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        padding: 10,
        minWidth: 150,
        minHeight: 50,
        cursor: 'pointer',
    },
    button: {
        color: theme.palette.secondary.light,
    },
    icon: {
        fill: theme.palette.secondary.light,
    },
}));

function OrderCard({
    onEdit,
    order,
}) {
    const classes = cardStyles();
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

    // Phone and email [label, value] pairs
    const phoneList = mapIfExists(order, 'customer.phones', (p) => ([showPhone(p.number), phoneLink(p.number)]));
    const emailList = mapIfExists(order, 'customer.emails', (e) => ([e.emailAddress, emailLink(e.emailAddress)]));

    return (
        <Card className={classes.root}>
            {phoneDialogOpen ? (
                <ListDialog
                    title={`Call ${order?.customer?.fullName}`}
                    data={phoneList}
                    onClose={callPhone} />
            ) : null}
            {emailDialogOpen ? (
                <ListDialog
                    title={`Email ${order?.customer?.fullName}`}
                    data={emailList}
                    onClose={sendEmail} />
            ) : null}
            <CardContent onClick={onEdit}>
                <Typography variant="h6" component="h3" gutterBottom>
                    {order?.customer?.fullName ?? ''}
                </Typography>
                <Typography variant="body1" component="h4">
                    Requested Date: {order?.desiredDeliveryDate ? new Date(order?.desiredDeliveryDate).toDateString('en-US') : 'Unset'}
                </Typography>
                <Typography variant="body1" component="h4">
                    Items: {order?.items?.length ?? 0}
                </Typography>
            </CardContent>
            <CardActions>
                <Button className={classes.button} variant="text" onClick={onEdit}>View</Button>
                {(phoneList?.length > 0) ?
                    (<Tooltip title="View phone numbers" placement="bottom">
                        <IconButton onClick={() => setPhoneDialogOpen(true)}>
                            <PhoneIcon className={classes.icon} />
                        </IconButton>
                    </Tooltip>)
                    : null}
                {(emailList?.length > 0) ?
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

OrderCard.propTypes = {
    order: PropTypes.object,
    onClick: PropTypes.func,
}

export { OrderCard };