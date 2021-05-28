import {  
    Button, 
    BottomNavigation, 
    BottomNavigationAction, 
    Grid,
    IconButton, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead,
    TableRow, 
    Tooltip 
} from '@material-ui/core';
import { 
    Email as EmailIcon,
    Phone as PhoneIcon,
    Room as RoomIcon
} from "@material-ui/icons";
import { makeStyles } from '@material-ui/core/styles';
import { 
    ADDRESS, 
    EMAIL,
    PHONE 
} from '@local/shared';

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
        overflowWrap: 'anywhere',
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
                <Table aria-label="contact-hours-table" size="small">
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
                    <Button fullWidth onClick={() => alert('Coming soon!')}>Contact Form</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button fullWidth onClick={() => alert('Coming soon!')}>Give Feedback</Button>
                </Grid>
            </Grid>
        </div>
    );
}

export { ContactInfo };