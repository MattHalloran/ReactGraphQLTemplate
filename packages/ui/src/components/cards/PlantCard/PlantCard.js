import React, { useCallback } from 'react';
import PropTypes from 'prop-types'
import { 
    Button,
    Card, 
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia, 
    Chip,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { displayPrice, getPlantTrait } from 'utils';
import { NoImageIcon } from 'assets/img';
import { IMAGE_USE, SERVER_URL } from '@local/shared';

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
    chip: {
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
}) {
    const classes = useStyles();
    console.log('IN PLANT CARDDDDD', plant)

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

    let display;
    const display_data = plant.images.find(image => image.usedFor === IMAGE_USE.PlantDisplay);
    if (display_data) {
        display = <CardMedia component="img" src={`${SERVER_URL}/${display_data.src}?size=L`} className={classes.displayImage} alt={display_data.alt} title={plant.latin_name} />
    } else {
        display = <NoImageIcon className={classes.displayImage} />
    }

    let subtitle;
    const commonName = getPlantTrait('commonName', plant);
    if (commonName) {
        subtitle = (
            <Typography gutterBottom variant="body1" component="h3">
                {commonName}
            </Typography>
        )
    }

    return (
        <Card className={classes.root} onClick={() => onClick(plant)}>
            <CardActionArea>
                {display}
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
}

export { PlantCard };