import { useState } from 'react';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Theme,
    Tooltip,
    Typography
} from '@material-ui/core';
import {
    Email as EmailIcon,
    Phone as PhoneIcon
} from "@material-ui/icons";
import { makeStyles } from '@material-ui/styles';
import { ListDialog } from 'components';
import { combineStyles, emailLink, mapIfExists, phoneLink, showPhone } from 'utils';
import { cardStyles } from './styles';

const componentStyles = (theme: Theme) => ({
    orderCardRoot: {
        padding: 10,
        minWidth: 150,
        minHeight: 50,
    },
    button: {
        color: theme.palette.secondary.light,
    },
})

const useStyles = makeStyles(combineStyles(cardStyles, componentStyles));

interface Props {
    order: any;
    onEdit: () => any;
}

export const OrderCard = ({
    onEdit,
    order,
}: Props) => {
    const classes = useStyles();
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

    const callPhone = (phoneLink?: string | null) => {
        setPhoneDialogOpen(false);
        if (phoneLink) window.location.href = phoneLink;
    }

    const sendEmail = (emailLink?: string | null) => {
        setEmailDialogOpen(false);
        if (emailLink) window.open(emailLink, '_blank', 'noopener,noreferrer')
    }

    const phoneList = mapIfExists(order, 'customer.phones', (p: any) => ({ label: showPhone(p.number), value: phoneLink(p.number)}));
    const emailList = mapIfExists(order, 'customer.emails', (e: any) => ({ label: e.emailAddress, value: emailLink(e.emailAddress)}));

    return (
        <Card className={`${classes.cardRoot} ${classes.orderCardRoot}`}>
            {phoneDialogOpen ? (
                <ListDialog
                    title={`Call ${order?.customer?.firstName} ${order?.customer?.lastName}`}
                    data={phoneList}
                    onClose={callPhone} />
            ) : null}
            {emailDialogOpen ? (
                <ListDialog
                    title={`Email ${order?.customer?.firstName} ${order?.customer?.lastName}`}
                    data={emailList}
                    onClose={sendEmail} />
            ) : null}
            <CardContent onClick={onEdit}>
                <Typography variant="h6" component="h3" gutterBottom>
                    {`${order?.customer?.firstName} ${order?.customer?.lastName}`}
                </Typography>
                <Typography variant="body1" component="h4">
                    Status: {order?.status}
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
                {(phoneList && phoneList?.length > 0) ?
                    (<Tooltip title="View phone numbers" placement="bottom">
                        <IconButton onClick={() => setPhoneDialogOpen(true)}>
                            <PhoneIcon className={classes.icon} />
                        </IconButton>
                    </Tooltip>)
                    : null}
                {(emailList && emailList?.length > 0) ?
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