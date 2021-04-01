import ProvenWinners from 'assets/img/proven-winners.png';
import AmericanHort from 'assets/img/american-hort.png';
import NJNLA from 'assets/img/njnla_logo.jpg';
import { BUSINESS_NAME, ADDRESS, PHONE, FAX, EMAIL, LINKS } from 'utils/consts';
import { printAvailability } from 'utils/printAvailability';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText, Grid, ButtonBase, Tooltip } from '@material-ui/core';
import BusinessIcon from '@material-ui/icons/Business';
import PhoneIcon from '@material-ui/icons/Phone';
import PrintIcon from '@material-ui/icons/Print';
import EmailIcon from '@material-ui/icons/Email';
import Copyright from 'components/Copyright/Copyright';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 'fit-content',
        overflow: 'hidden',
        backgroundColor: `${theme.palette.primary.dark}`,
        color: `${theme.palette.primary.contrastText}`,
        borderTop: `2px solid ${theme.palette.text.primary}`,
        position: 'relative',
        paddingBottom: '7vh',
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
    upper: {
        textTransform: 'uppercase',
    },
    imageContainer: {
        maxWidth: '33vw',
        padding: 10,
    },
    image: {
        maxWidth: '100%',
        maxHeight: 200,
        background: theme.palette.primary.contrastText,
    },
    provenWinner: {
        maxHeight: 'min(100%,150px)',
        maxWidth: 'min(100%,150px)',
        margin: 'auto',
    },
    icon: {
        fill: theme.palette.primary.contrastText,
    },
    copyright: {
        color: theme.palette.primary.contrastText,
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

    const contactLinks = [
        ['address', 'View in Google Maps', ADDRESS.Link, ADDRESS.Label, BusinessIcon],
        ['contact-phone', 'Call Us', PHONE.Link, PHONE.Label, PhoneIcon],
        ['contact-fax', 'Fax Us', FAX.Link, FAX.Label, PrintIcon],
        ['contact-email', 'Email Us', EMAIL.Link, EMAIL.Label, EmailIcon],
    ]

    const bottomImages = [
        ["https://www.provenwinners.com/", "We Sell Proven Winners - The #1 Plant Brand", ProvenWinners],
        ["https://www.americanhort.org/", "Proud member of the AmericanHort", AmericanHort],
        ["https://www.njnla.org/", "Proud member of the New Jersey Nursery and Landscape Association", NJNLA],
    ]

    return (
        <div className={classes.root}>
            <Grid container justifyContent='center' spacing={1}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
                    <List component="nav">
                        <ListItem button component="h5" >
                            <ListItemText className={classes.upper} primary={BUSINESS_NAME.Long} />
                        </ListItem>
                        {contactLinks.map(([label, tooltip, src, text, Icon]) => (
                            <Tooltip title={tooltip}>
                                <ListItem button component="a" aria-label={label} href={src}>
                                    <ListItemIcon>
                                        <Icon className={classes.icon} ></Icon>
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItem>
                            </Tooltip>
                        ))}
                    </List>
                </Grid>
                {bottomImages.map(([src, alt, img]) => (
                    <Grid item xs={4}>
                        <Tooltip title={alt}>
                            <ButtonBase className={classes.imageContainer}>
                                <a href={src} target="_blank" rel="noopener noreferrer">
                                    <img className={classes.image} alt={alt} src={img} />
                                </a>
                            </ButtonBase>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
            <Copyright className={classes.copyright} />
        </div>
    );
}

export default Footer;
