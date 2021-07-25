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
        color: theme.palette.secondary.light,
    },
    icon: {
        fill: theme.palette.secondary.light,
    },
}));

function OrderCard({
    onEdit,
    customer,
    items,
    desired_delivery_date,
}) {
    const classes = cardStyles();
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

    const callPhone = (number) => {
        setPhoneDialogOpen(false);
        if (!number) return;
        let url = `tel:${number}`;
        window.location.href = url;
    }

    const sendEmail = (address, subject = '', body = '') => {
        setEmailDialogOpen(false);
        if (!address) return;
        let url = `mailto:${address}?subject=${subject}&body=${body}`;
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    // Phone and email [label, value] pairs
    let phone_list = customer.phones?.map(p => (
        [p.unformatted_number, `${p.country_code}${p.unformatted_number}`]
    )) ?? [];
    let email_list = customer.emails?.map(e => (
        [e.email_address, e.email_address]
    )) ?? [];

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
                    {customer.first_name} {customer.last_name}
                </Typography>
                <Typography variant="body1" component="h4">
                    Requested Date: {new Date(desired_delivery_date).toLocaleString('en-US').split(',')[0]}
                </Typography>
                <Typography variant="body1" component="h4">
                    Items: {items.length}
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
    id: PropTypes.number,
    onEdit: PropTypes.func.isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    account_status: PropTypes.number,
    onClick: PropTypes.func,
}

export { OrderCard };