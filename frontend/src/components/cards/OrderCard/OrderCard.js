import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardContent, Typography, Chip } from '@material-ui/core';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import { makeStyles } from '@material-ui/core/styles';

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
}));

function OrderCard({
    onEdit,
    customer,
    items,
    desired_delivery_date,
}) {
    const classes = cardStyles();
    
    const callPhone = (number) => {
        let tel = `tel:${number}`;
        window.location.href = tel;
    }

    let phoneChips = customer.phones?.map(p => (
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

    let emailChips = customer.emails?.map(e => (
        <Chip
            className={classes.chip}
            onClick={() => sendEmail(e.email_address)}
            icon={<EmailIcon />}
            label={e.email_address}
            color="secondary" />
    ));

    return (
        <Card className={classes.root} onClick={onEdit}>
            <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                    {customer.first_name} {customer.last_name}
                </Typography>
                <Typography variant="body1" component="h4">
                    Requested Date: {new Date(desired_delivery_date).getDate()}
                </Typography>
                <Typography variant="body1" component="h4">
                    Items: {items.length}
                </Typography>
                {phoneChips}
                {emailChips}
            </CardContent>
            <CardActions>
                <Button className={classes.button} variant="text" onClick={onEdit}>View</Button>
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

export default OrderCard;