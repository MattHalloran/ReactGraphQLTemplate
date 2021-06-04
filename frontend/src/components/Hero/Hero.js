import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { LINKS } from 'utils';
import { Slider } from './Slider.js'
import Hero1 from 'assets/img/hero-chicks.jpg';
import Hero2 from 'assets/img/hero-rainbow.jpg';
import Hero3 from 'assets/img/hero-plants.jpg';
import Hero4 from 'assets/img/hero-butterfly.jpg';

const useStyles = makeStyles(() => ({
    hero: {
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    contentWrapper: {
        position: 'absolute',
        top: '0',
        left: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    textPop: {
        padding: '0',
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        textShadow:
            `-1px -1px 0 black,  
            1px -1px 0 black,
            -1px 1px 0 black,
            1px 1px 0 black`
    },
    title: {
        margin: '0 auto',
        width: '90%'
    },
    subtitle: {
        margin: '24px auto 0',
        width: '80%'
    },
    mainButton: {
        pointerEvents: 'auto'
    }
}));

const images = [
    Hero1,
    Hero2,
    Hero3,
    Hero4,
]

function Hero({
    text,
    subtext,
}) {
    let history = useHistory();
    const classes = useStyles();

    return (
        <div className={classes.hero}>
            <Slider images={images} autoPlay={true} />
            <div className={classes.contentWrapper}>
                <Typography variant='h2' component='h1' className={classes.title + ' ' + classes.textPop}>{text}</Typography>
                <Typography variant='h4' component='h2' className={classes.subtitle + ' ' + classes.textPop}>{subtext}</Typography>
                <Button
                    type="submit"
                    color="primary"
                    className={classes.mainButton}
                    onClick={() => history.push(LINKS.Shopping)}
                >
                    Request Quote
                </Button>
            </div>
        </div>
    );
};

Hero.propTypes = {
    text: PropTypes.string.isRequired,
    subtext: PropTypes.string.isRequired,
}

export { Hero };
