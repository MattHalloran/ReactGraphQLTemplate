import RoomIcon from '@material-ui/icons/Room';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';
import { ADDRESS, PHONE, EMAIL } from 'utils/consts';
import { Tooltip, Button, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, BottomNavigation, BottomNavigationAction, IconButton, Grid, Icon } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.light,
    },
    tableHead: {
        background: theme.palette.primary.main,
    },
    tableHeadCell: {
        color: theme.palette.primary.contrastText,
    },
    tableRow: {
        background: theme.palette.background.paper,
    },
    nav: {
        background: 'transparent',
        height: 'fit-content',
    },
    navAction: {
        alignItems: 'baseline',
        color: theme.palette.primary.contrastText,
    },
    iconButton: {
        background: theme.palette.secondary.main,
        fill: theme.palette.secondary.contrastText,
    },
}));

function ContactInfo({
    ...props
}) {
    const classes = useStyles();

    const openLink = (e, link) => {
        window.location = link;
        e.preventDefault();
    }

    const hours = [
        'MON-FRI: 8:00 am to 3:00 pm',
        'SAT-SUN: Closed',
        'Note: Closed daily from 12:00 pm to 1:00 pm',
    ]

    const contactInfo = [
        ['Open in Google Maps', ADDRESS.Label, ADDRESS.Link, RoomIcon],
        ['Call Us', PHONE.Label, PHONE.Link, PhoneIcon],
        ['Email Us', EMAIL.Label, EMAIL.Link, EmailIcon]
    ]

    return (
        <div className={classes.root} {...props}>
            <TableContainer>
                <Table aria-label="contact-hours-table">
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            <TableCell className={classes.tableHeadCell}>Hours</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hours.map((row, index) => (
                            <TableRow key={index} className={classes.tableRow}>
                                <TableCell>
                                    {row}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <BottomNavigation className={classes.nav} showLabels>
                {contactInfo.map(([tooltip, label, link, Icon]) => (
                    <Tooltip title={tooltip} placement="top">
                        <BottomNavigationAction className={classes.navAction} label={label} onClick={(e) => openLink(e, link)} icon={
                            <IconButton className={classes.iconButton}>
                                <Icon />
                            </IconButton>
                        } />
                    </Tooltip>
                ))}
            </BottomNavigation>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6}>
                    <Button fullWidth>Contact Form</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button fullWidth>Give Feedback</Button>
                </Grid>
            </Grid>
        </div>
    );
}

export default ContactInfo;