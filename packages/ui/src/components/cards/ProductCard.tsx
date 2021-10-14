import React from 'react';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    Theme,
    Tooltip,
    Typography
} from '@material-ui/core';
import { Launch as LaunchIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { combineStyles, getImageSrc } from 'utils';
import { NoImageWithTextIcon } from 'assets/img';
import { ImageUse, SERVER_URL } from '@local/shared';
import { cardStyles } from './styles';

const componentStyles = (theme: Theme) => ({
    displayImage: {
        minHeight: 200,
        maxHeight: '50%',
        position: 'absolute',
    },
    topMargin: {
        marginTop: 200,
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
})

const useStyles = makeStyles(combineStyles(cardStyles, componentStyles));

interface Props {
    onClick: () => any;
    product: any;
}

export const ProductCard: React.FC<Props> = ({
    onClick,
    product,
}) => {
    const classes = useStyles();

    let display;
    let display_data = product.images.find(image => image.usedFor === ImageUse.PRODUCT_DISPLAY)?.image;
    if (!display_data && product.images.length > 0) display_data = product.images[0].image;
    if (display_data) {
        display = <CardMedia component="img" src={`${SERVER_URL}/${getImageSrc(display_data)}`} className={classes.displayImage} alt={display_data.alt} title={product.name} />
    } else {
        display = <NoImageWithTextIcon className={classes.displayImage} />
    }

    return (
        <Card className={classes.cardRoot} onClick={() => onClick({ product, selectedSku: product.skus[0] })}>
            <CardActionArea>
                {display}
                <CardContent className={`${classes.content} ${classes.topMargin}`}>
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