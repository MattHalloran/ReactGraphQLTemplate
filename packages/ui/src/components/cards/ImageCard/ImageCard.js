import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    TextField
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/styles';
import { lightTheme } from 'utils';
import { useEffect, useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const useStyles = makeStyles((theme) => ({
    root: {
        //background: theme.palette.primary.main,
        background: lightTheme.palette.primary.main,
        //color: theme.palette.primary.contrastText,
        color: lightTheme.palette.primary.contrastText,
        borderRadius: 15,
        margin: 3,
        cursor: 'pointer',
        '.MuiMenu-paper': {
            transitionDuration: '0s !important',
        }
    },
    displayImage: {
        height: 0,
        paddingTop: '56.25%',
    },
    content: {
        padding: 0,
        position: 'inherit',
    },
    actionButton: {
        //color: theme.palette.primary.contrastText,
        color: lightTheme.palette.primary.contrastText,
    },
}));

function ImageCard({
    onDelete,
    onEdit,
    data,
    index,
    moveCard
}) {
    const classes = useStyles();
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: 'card',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            moveCard(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'card',
        item: () => {
            return { data, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
        <Card
            className={classes.root}
            style={{ opacity }}
            ref={ref}
        >
            <CardContent className={classes.content}>
                <CardMedia image={data.src} className={classes.displayImage} />
            </CardContent>
            <CardActions disableSpacing>
                <IconButton aria-label="edit image data" onClick={onEdit}>
                    <EditIcon className={classes.actionButton} />
                </IconButton>
                <IconButton aria-label="delete image" onClick={onDelete}>
                    <DeleteIcon className={classes.actionButton} />
                </IconButton>
            </CardActions>
        </Card>
    );
}

ImageCard.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    moveCard: PropTypes.func.isRequired,
}

export { ImageCard };