import RoomIcon from '@material-ui/icons/Room';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';
import { GOOGLE_MAPS_ADDRESS } from 'utils/consts';
import { Button, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, BottomNavigation, BottomNavigationAction, IconButton, Grid } from '@material-ui/core';
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

    const openMaps = (e) => {
        window.location = GOOGLE_MAPS_ADDRESS;
        e.preventDefault();
    }

    const openMail = (e) => {
        window.location = "mailto:info@newlifenurseryinc.com";
        e.preventDefault();
    }

    const openPhone = (e) => {
        window.location = "tel:+18564553601";
        e.preventDefault();
    }

    const hours = [
        'MON-FRI: 8:00 am to 3:00 pm',
        'SAT-SUN: Closed',
        'Note: Closed daily from 12:00 pm to 1:00 pm',
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
                <BottomNavigationAction className={classes.navAction} label="106 South Woodruff Road Bridgeton, NJ 08302" onClick={openMaps} icon={
                    <IconButton className={classes.iconButton}>
                        <RoomIcon />
                    </IconButton>
                } />
                <BottomNavigationAction className={classes.navAction} label="info@newlifenurseryinc.com" onClick={openMail} icon={
                    <IconButton className={classes.iconButton}>
                        <EmailIcon />
                    </IconButton>
                } />
                <BottomNavigationAction className={classes.navAction} label="(856) 455-3601" onClick={openPhone} icon={
                    <IconButton className={classes.iconButton}>
                        <PhoneIcon />
                    </IconButton>
                } />
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

ContactInfo.propTypes = {
            }

export default ContactInfo;