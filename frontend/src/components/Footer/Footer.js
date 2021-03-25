import { Link } from 'react-router-dom';
import ProvenWinners from 'assets/img/proven-winners.png';
import AmericanHort from 'assets/img/american_hort_logo.jpg';
import NJNLA from 'assets/img/njnla_logo.jpg';
import { FULL_BUSINESS_NAME, GOOGLE_MAPS_ADDRESS, LINKS } from 'utils/consts';
import { printAvailability } from 'utils/printAvailability';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText, Grid } from '@material-ui/core';
import PhoneIcon from '@material-ui/icons/Phone';
import PrintIcon from '@material-ui/icons/Print';
import Copyright from 'components/Copyright/Copyright';

const useStyles = makeStyles((theme) => ({
    footer: {
        backgroundColor: `${theme.palette.primary.dark}`,
        color: `${theme.palette.primary.contrastText}`,
        borderTop: `2px solid ${theme.palette.text.primary}`,
        position: 'relative',
        bottom: '0',
        width: '100%',
        overflow: 'hidden',
        'li': {
            display: 'block',
        },
        'a:link, a:visited': {
            color: `${theme.palette.text.primary}`,
        }
    },
    footerGroup: {
        padding: '0 10px',
        minWidth: '150px',
        height: 'auto',
        'li': {
            paddingBottom: '10px',
        }
    },
    flexed: {
        display: 'grid',
        padding: '5px',
        gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
        gridGap: '10px',
        '-webkit-align-items': 'stretch',
        '-webkit-box-align': 'stretch',
        '-ms-flex-align': 'stretch',
        alignItems: 'stretch',
        '> *': {
            borderRight: `1px solid ${theme.palette.text.primary}`,
        },
        '> *:last-child': {
            borderRight: 'none',
        }
    },
    winnerDiv: {
        display: 'grid',
    },
    provenWinner: {
        maxHeight: 'min(100%,150px)',
        maxWidth: 'min(100%,150px)',
        margin: 'auto',
    },
    icon: {
        fill: theme.palette.primary.contrastText,
    },
    [theme.breakpoints.down("sm")]: {
        footerGroup: {
            border: `1px solid ${theme.palette.text.primary}`,
        },
        flexed: {
            '> *:last-child': {
                borderRight: `1px solid ${theme.palette.text.primary}`,
            }
        }
    },
}));

function Footer({
}) {
    const classes = useStyles();
    return (
        <div>
            <Grid container justify='center' className={classes.footer} spacing={1}>
                <Grid item xs={12}>
                    <List component="nav">
                        <ListItem button component="a" href={LINKS.About} >
                            <ListItemText primary="About Us" />
                        </ListItem>
                        <ListItem button component="a" href={LINKS.Contact} >
                            <ListItemText primary="Contact Us" />
                        </ListItem>
                        <ListItem
                            button
                            component="a"
                            href='/docs/Confidential_Commercial_Credit_Application-2010.doc'
                            target='_blank'
                            rel="noopener noreferrer"
                            download="Confidential_Commercial_Credit_Application"
                        >
                            <ListItemText primary="Credit App" />
                        </ListItem>
                        <ListItem button href={LINKS.About} onClick={printAvailability} >
                            <ListItemText primary="Print Availability" />
                        </ListItem>
                        <ListItem button component="a" href={LINKS.Gallery} >
                            <ListItemText primary="Gallery" />
                        </ListItem>
                        {/* <ListItem button component="a" href={LINKS.Featured} >
                            <ListItemText primary="Featured Plants" />
                        </ListItem> */}
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <List component="nav">
                        <ListItem button component="h5" >
                            <ListItemText primary="NEW LIFE NURSERY INC." />
                        </ListItem>
                        <ListItem button component="a" aria-label="address" href={GOOGLE_MAPS_ADDRESS} >
                            <ListItemText primary="106 South Woodruff Road Bridgeton, NJ 08302" />
                        </ListItem>
                        <ListItem button component="a" aria-label="contact-phone" href='tel:+18564553601' >
                            <ListItemIcon>
                                <PhoneIcon className={classes.icon} />
                            </ListItemIcon>
                            <ListItemText primary="(856) 455-3601" />
                        </ListItem>
                        <ListItem button component="a" aria-label="contact-fax" href='tel:+18564511530' >
                            <ListItemIcon>
                                <PrintIcon className={classes.icon} />
                            </ListItemIcon>
                            <ListItemText primary="(856) 451-1530" />
                        </ListItem>
                        <ListItem button component="a" aria-label="contact-email" href='mailto:info@newlifenurseryinc.com' >
                            <ListItemText primary="Email: info@newlifenurseryinc.com" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <a style={{ display: 'contents' }} href="https://www.provenwinners.com/" target="_blank" rel="noopener noreferrer"><img src={ProvenWinners} alt="We Sell Proven Winners - The #1 Plant Brand" className="proven-winner" /></a>
                </Grid>
                <Grid item xs={12}>
                    <a style={{ display: 'contents' }} href="https://www.americanhort.org/" target="_blank" rel="noopener noreferrer"><img src={AmericanHort} alt="Proud member of the AmericanHort" className="proven-winner" /></a>
                </Grid>
                <Grid item xs={12}>
                    <a style={{ display: 'contents' }} href="https://www.njnla.org/" target="_blank" rel="noopener noreferrer"><img src={NJNLA} alt="Proud member of the New Jersey Nursery and Landscape Association" className="proven-winner" /></a>
                </Grid>
            </Grid>
            <Copyright />
        </div>
    );
}

export default Footer;
