import React from 'react';
import { InformationalBreadcrumbs } from 'components';
import {
    Grid,
    Typography
} from '@material-ui/core';
import Facebook from 'assets/img/Facebook.png';
import Instagram from 'assets/img/Instagram.png';
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@emotion/react';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
    social: {
        width: '80px',
        height: '80px',
    }
}));

function AboutPage({
    business,
}) {
    const classes = useStyles();
    const theme = useTheme();
    const socials = [
        [Facebook, 'Facebook', business?.SOCIAL?.Facebook],
        [Instagram, 'Instagram', business?.SOCIAL?.Instagram],
    ]

    return (
        <div id='page'>
            <InformationalBreadcrumbs textColor={theme.palette.secondary.dark} />
            <br/>
            <Grid container spacing={2}>
                <Grid item md={12} lg={8}>
                    <div className={classes.header}>
                        <Typography variant="h3" component="h1">Our Story</Typography>
                    </div>
                    <p>For  40 years, New Life Nursery, Inc has been striving to grow the most beautiful, healthy and consistent plant material at competitive prices. Family owned and operated by the Gianaris Family, we continue to hold to our original motto: "Growing top quality material for buyers who are interested in the best".</p>
                    <p>As wholesale growers, we are always looking ahead to the next season with anticipation for something new. In addition to the wonderful trees and shrubs you have come to expect from New Life Nursery, Inc, we look forward to offering many new varieties as we head into each new season. Feel free to contact us for access to our updated availability list. As always, we encourage our customers to send us their comments and suggestions.</p>
                    <p>With over 70 acres in production, New Life Nursery, Inc has the trees and shrubs you need, when you need them. All sizes, from 3-gallon shrubs to 25-gallon trees, are grown here on our farm in Southern New Jersey. Browse our Availability List, and contact us if you would like more information, or to speak with one of our experts at <a href={business?.PHONE?.Link}>{business?.PHONE?.Label}</a>.</p>
                    <p>Warmest Wishes,</p>
                    <h2 style={{ fontFamily: 'fantasy' }}>The Gianaris Family</h2>
                </Grid>
                <Grid item md={12} lg={4}>
                    <div className={classes.header}>
                        <Typography variant="h4" component="h2">Check out our socials</Typography>
                    </div>
                    {socials.map(s => (
                        <a href={s[2]} target="_blank" rel="noopener noreferrer">
                            <img className={classes.social} alt={s[1]} src={s[0]} />
                        </a>
                    ))}
                </Grid>
            </Grid>
        </div >
    );
}

AboutPage.propTypes = {
}

export { AboutPage };