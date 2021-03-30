import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import { Button, Card, CardContent, CardActions, Typography, TextField, CardActionArea } from '@material-ui/core';
import { ACCOUNT_STATUS, DEFAULT_PRONOUNS } from 'utils/consts';
import { NoImageIcon } from 'assets/img';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        cursor: 'default',
    },
    content: {
        padding: 8,
        position: 'inherit',
    },
    image: {
        height: 150,
        width: 'fit-content',
        objectFit: 'cover',
    },
    actionButton: {
        color: theme.palette.primary.contrastText,
        cursor: 'pointer',
    },
}));

function GalleryCard({
    index,
    src,
    alt,
    description,
    onUpdate,
    onDelete,
}) {
    const classes = useStyles();
    let display_image;
    if (src) {
        display_image = <img src={src} className={classes.image} alt={alt} />
    } else {
        display_image = <NoImageIcon className={classes.image} />
    }

    return (
        <Card className={classes.root}>
            {display_image}
                <CardContent className={classes.content}>
                    <TextField
                        name="imageTag"
                        fullWidth
                        id={`gallery-image-tag-${index}`}
                        label="Tag"
                        value={alt}
                        onChange={e => onUpdate(index, 'alts', e.target.value)}
                    />
                    <TextField
                        name="imageTag"
                        fullWidth
                        id={`gallery-image-tag-${index}`}
                        label="Tag"
                        value={description}
                        onChange={e => onUpdate(index, 'descs', e.target.value)}
                    />
                </CardContent>
            <CardActions>
                <Button className={classes.actionButton} size="small" variant="text" onClick={() => onUpdate(index, alt, description)}>
                    Update
                </Button>
                <Button className={classes.actionButton} size="small" variant="text" onClick={() => onDelete(index)}>
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
}

GalleryCard.propTypes = {
    index: PropTypes.number.isRequired,
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
}

export default GalleryCard;