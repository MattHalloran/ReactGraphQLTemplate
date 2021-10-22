import { LINKS, printAvailability } from 'utils';
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, Grid, Tooltip, Theme } from '@material-ui/core';
import {
    Business as BusinessIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@material-ui/icons';
import { CopyrightBreadcrumbs } from 'components';
import { useHistory } from 'react-router';
import { CommonProps } from 'types';
import { useCallback } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        overflow: 'hidden',
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        position: 'relative',
        paddingBottom: '7vh',
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
    icon: {
        fill: theme.palette.primary.contrastText,
    },
    copyright: {
        color: theme.palette.primary.contrastText,
    },
}));

export const Footer = ({
    business,
    userRoles,
}: Pick<CommonProps, 'business' | 'userRoles'>) => {
    const classes = useStyles();
    const history = useHistory();
    const theme = useTheme();

    const contactLinks = [
        ['address', 'View in Google Maps', business?.ADDRESS?.Link, business?.ADDRESS?.Label, BusinessIcon],
        ['contact-phone', 'Call Us', business?.PHONE?.Link, business?.PHONE?.Label, PhoneIcon],
        ['contact-email', 'Email Us', business?.EMAIL?.Link, business?.EMAIL?.Label, EmailIcon],
    ]

    const toAbout = useCallback(() => history.push(LINKS.About), [history]);
    const toGallery = useCallback(() => history.push(LINKS.Gallery), [history]);
    const toShopping = useCallback(() => history.push(LINKS.Shopping), [history]);
    const availabilityPrint = useCallback(() => printAvailability(Array.isArray(userRoles), business?.BUSINESS_NAME?.Long), [business?.BUSINESS_NAME?.Long, userRoles]);

    return (
        <div className={classes.root}>
            <Grid container justifyContent='center' spacing={1}>
                <Grid item xs={12} sm={6}>
                    <List component="nav">
                        <ListItem component="h3" >
                            <ListItemText className={classes.upper} primary="Resources" />
                        </ListItem>
                        <ListItem button component="a" onClick={toAbout} >
                            <ListItemText primary="About Us" />
                        </ListItem>
                        <ListItem button component="a" onClick={toGallery} >
                            <ListItemText primary="Gallery" />
                        </ListItem>
                        <ListItem button component="a" onClick={toShopping} >
                            <ListItemText primary="Shop" />
                        </ListItem>
                        <ListItem button component="a" onClick={availabilityPrint} >
                            <ListItemText primary="Print Availability" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <List component="nav">
                        <ListItem component="h3" >
                            <ListItemText className={classes.upper} primary="Contact" />
                        </ListItem>
                        {contactLinks.map(([label, tooltip, src, text, Icon], key) => (
                            <Tooltip key={key} title={tooltip} placement="left">
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
            </Grid>
            <CopyrightBreadcrumbs className={classes.copyright} business={business} textColor={theme.palette.primary.contrastText} />
        </div>
    );
}
