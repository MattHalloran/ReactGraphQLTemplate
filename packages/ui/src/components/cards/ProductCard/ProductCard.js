import React from 'react';
import PropTypes from 'prop-types'
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    Tooltip,
    Typography
} from '@material-ui/core';
import { Launch as LaunchIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { getImageSrc } from 'utils';
import { NoImageWithTextIcon } from 'assets/img';
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
    deleted: {
        border: '2px solid red',
    },
    inactive: {
        border: '2px solid grey',
    },
    active: {
        border: `2px solid ${theme.palette.secondary.dark}`,
    },
    icon: {
        color: theme.palette.secondary.light,
    },
}));

function ProductCard({
    onClick,
    product,
}) {
    const classes = useStyles();

    let display;
    let display_data = product.images.find(image => image.usedFor === IMAGE_USE.ProductDisplay)?.image;
    if (!display_data && product.images.length > 0) display_data = product.images[0].image;
    if (display_data) {
        display = <CardMedia component="img" src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={product.name} />
    } else {
        display = <NoImageWithTextIcon className={classes.displayImage} />
    }

    return (
        <Card className={classes.root} onClick={() => onClick({ product, selectedSku: product.skus[0] })}>
            <CardActionArea>
                {display}
                <CardContent className={classes.content}>
                    <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Tooltip title="View" placement="bottom">
                    <IconButton onClick={onClick}>
                        <LaunchIcon className={classes.icon} />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

ProductCard.propTypes = {
    onClick: PropTypes.func.isRequired,
    product: PropTypes.object.isRequired,
}

export { ProductCard };