import PropTypes from 'prop-types'
import { displayPrice } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardContent, CardActionArea, CardMedia, CardActions, Typography, Chip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        cursor: 'pointer',
    },
    displayImage: {
        minHeight: 200,
        maxHeight: '50%',
        position: 'absolute',
    },
    content: {
        padding: 8,
        marginTop: 200,
        position: 'inherit',
    },
    skuChip: {
        margin: 2,
    },
    deleted: {
        border: '2px solid red',
    },
    inactive: {
        border: '2px solid grey',
    },
    active: {
        border: `2px solid ${theme.palette.secondary.dark}`,
    },
    actionButton: {
        color: theme.palette.primary.contrastText,
    },
}));

function PlantCard({
    onClick,
    plant,
    thumbnail
}) {
    const classes = useStyles();

    const SkuStatus = {
        '-2': classes.deleted,
        '-1': classes.inactive,
        '1': classes.active,
    }

    let sizes = plant.skus?.map(s => (
        <Chip 
            className={`${classes.skuChip} ${SkuStatus[s.status+''] ?? classes.deleted}`} 
            label={`#${s.size} | ${displayPrice(s.price)} | Avail: ${s.availability}`} 
            color="secondary" />
    ));

    let display_image;
    if (thumbnail) {
        display_image = <CardMedia component="img" src={`data:image/jpeg;base64,${thumbnail}`} className={classes.displayImage} title={plant.latin_name} />
    } else {
        display_image = <NoImageIcon className={classes.displayImage} />
    }

    let subtitle;
    if (plant.common_name) {
        subtitle = (
            <Typography gutterBottom variant="body1" component="h3">
                {plant.common_name}
            </Typography>
        )
    }

    return (
        <Card className={classes.root} onClick={onClick}>
            <CardActionArea>
                {display_image}
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h6" component="h2">
                        {plant.latin_name}
                    </Typography>
                    {subtitle}
                    <div className="size-container">
                        {sizes}
                    </div>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button className={classes.actionButton} size="small" variant="text" onClick={onClick}>
                    View
                </Button>
            </CardActions>
        </Card>
    );
}

PlantCard.propTypes = {
    onClick: PropTypes.func.isRequired,
    plant: PropTypes.object.isRequired,
    thumbnail: PropTypes.object,
}

export default PlantCard;