import React from 'react';
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
import { showPrice, getImageSrc, getPlantTrait } from 'utils';
import { NoImageWithTextIcon } from 'assets/img';
import { IMAGE_USE, SERVER_URL, SKU_STATUS } from '@local/shared';

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

    const SkuStatus = {
        [SKU_STATUS.Deleted]: classes.deleted,
        [SKU_STATUS.Inactive]: classes.inactive,
        [SKU_STATUS.Active]: classes.active,
    }

    const openWithSku = (e, sku) => {
        e.stopPropagation();
        console.log('IN OPEN WITH SKU', sku)
        onClick({ plant, selectedSku: sku })
    }

    let sizes = plant.skus?.map(s => (
        <Chip
            key={s.sku}
            className={`${classes.chip} ${SkuStatus[s.status + ''] ?? classes.deleted}`}
            label={`#${s.size} | ${showPrice(s.price)} | Avail: ${s.availability}`}
            color="secondary" 
            onClick={(e) => openWithSku(e, s)}
        />
    ));

    let display;
    let display_data = plant.images.find(image => image.usedFor === IMAGE_USE.PlantDisplay)?.image;
    if (!display_data && plant.images.length > 0) display_data = plant.images[0].image;
    if (display_data) {
        display = <CardMedia component="img" src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={plant.latinName} />
    } else {
        display = <NoImageWithTextIcon className={classes.displayImage} />
    }

    return (
        <Card className={classes.root} onClick={() => onClick({ plant, selectedSku: plant.skus[0] })}>
            <CardActionArea>
                {display}
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h6" component="h3">
                        {getPlantTrait('commonName', plant) ?? plant.latinName}
                    </Typography>
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