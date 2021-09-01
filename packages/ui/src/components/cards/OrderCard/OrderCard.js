import React from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { 
    Button, 
    Card, 
    CardActions, 
    CardContent, 
    IconButton,
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
        margin: theme.spacing(1),
        padding: 10,
        minWidth: 150,
        minHeight: 50,
        cursor: 'pointer',
    },
    button: {
        color: theme.palette.primary.contrastText,
    },
    icon: {
        fill: theme.palette.primary.contrastText,
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
        window.location.href = phoneLink;
    }

    const sendEmail = (emailLink) => {
        setEmailDialogOpen(false);
        window.open(emailLink, '_blank', 'noopener,noreferrer')
    }

    // Phone and email [label, value] pairs
    //const phone_list = mapIfExists(order, 'customer.phones', (p) => ([showPhone(p.number), phoneLink(p.number)]));
    const phone_list = [['8675309', 'asdfdsafdsa'], ['fdafdasf', 'fffffffff']]
    const email_list = mapIfExists(order, 'customer.emails', (e) => ([e.emailAddress, emailLink(e.emailAddress)]));

    return (
        <Card className={classes.root}>
            {phoneDialogOpen ? (
                <ListDialog
                    title="Select Phone"
                    data={phone_list}
                    onClose={callPhone} />
            ) : null}
            {emailDialogOpen ? (
                <ListDialog
                    title="Select Email"
                    data={email_list}
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
                {(phone_list.length > 0) ?
                    (<IconButton onClick={() => setPhoneDialogOpen(true)}>
                        <PhoneIcon className={classes.icon} />
                    </IconButton>)
                    : null}
                {(email_list.length > 0) ?
                    (<IconButton onClick={() => setEmailDialogOpen(true)}>
                        <EmailIcon className={classes.icon} />
                    </IconButton>)
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